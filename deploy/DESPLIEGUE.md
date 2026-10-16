# Despliegue de SENTINEL en el laboratorio

Dos PCs con Windows y Docker Desktop, con las IPs del diseño en Packet Tracer (`propuesta_reto_original.pkt`). Las imágenes ya están publicadas en Docker Hub ([miguelgarduno123](https://hub.docker.com/u/miguelgarduno123)); en las PCs **no se necesita el código**, solo la carpeta de cada PC con su `docker-compose.yml` y su `.env`. Todo va por HTTP, sin certificado.

| PC | IP | Máscara | Gateway | VLAN | Carpeta | Imágenes | Puerto |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Base de datos | 172.16.64.10 | 255.255.255.248 | 172.16.64.9 | 10 | `db` | `sentinel-db` | 3306 |
| Back/Front | 172.16.64.2 | 255.255.255.248 | 172.16.64.1 | 30 | `app` | `sentinel-proxy`, `sentinel-backend`, `sentinel-admin-web` | 80 |
| Mac con simulador | 172.16.0.2 | 255.255.192.0 | 172.16.0.1 | 20 | – | – | – |

Direcciones:

- Panel web: `http://172.16.64.2/`
- API (panel y app iOS): `http://172.16.64.2/api`
- Documentación de la API (Swagger): `http://172.16.64.2/api/docs` (se apaga con `SWAGGER=0` en `app/.env`)

## 1. En las dos PCs (con internet)

1. Instalar [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/) con WSL 2 y abrirlo hasta que diga *Engine running*.
2. Copiar a la PC su carpeta (`db` o `app`) del zip `sentinel-lab-docker.zip`, por ejemplo en `C:\sentinel`.
3. Descargar las imágenes **mientras haya internet**, desde la carpeta de esa PC (`C:\sentinel\db` o `C:\sentinel\app`):

   ```powershell
   docker compose pull
   ```

## 2. PC de la base de datos (172.16.64.10)

```powershell
cd C:\sentinel\db
copy .env.example .env
notepad .env
```

Llenen `MYSQL_ROOT_PASSWORD` y `MYSQL_PASSWORD` con contraseñas largas de **solo letras y números** (la segunda va dentro de una URL). Anoten `MYSQL_PASSWORD`: la necesita la otra PC.

Poner la IP fija (`Win + R` → `ncpa.cpl` → adaptador Ethernet → *Propiedades* → *IPv4*: `172.16.64.10`, `255.255.255.248`, `172.16.64.9`) y en PowerShell como administrador:

```powershell
Set-NetConnectionProfile -InterfaceAlias "Ethernet" -NetworkCategory Private
New-NetFirewallRule -DisplayName "SENTINEL MySQL" -Direction Inbound -Protocol TCP -LocalPort 3306 -Action Allow -Profile Private
docker compose up -d
docker compose ps
```

Esperen a que diga `healthy`. La primera vez se crean las tablas y los datos de prueba. Nunca usen `docker compose down -v`: borra la base.

## 3. PC Back/Front (172.16.64.2)

```powershell
cd C:\sentinel\app
copy .env.example .env
notepad .env
```

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | `mysql://sentinel:<MYSQL_PASSWORD de la PC de la base>@172.16.64.10:3306/sentinel` |
| `JWT_SECRET` | La salida de este comando en PowerShell: `$b = New-Object byte[] 48; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)` |

Poner la IP fija (`172.16.64.2`, `255.255.255.248`, `172.16.64.1`) y:

```powershell
Set-NetConnectionProfile -InterfaceAlias "Ethernet" -NetworkCategory Private
New-NetFirewallRule -DisplayName "SENTINEL Web" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow -Profile Private
docker compose up -d
docker compose ps
docker compose logs backend
```

`ps` debe mostrar `proxy`, `backend` y `admin-web` en *running*, y el log `Conectando a mysql://***@172.16.64.10:3306/sentinel`. Las evidencias se guardan en el volumen `evidence_data` y ya incluyen las imágenes de ejemplo.

Docker Desktop no conserva la IP real de cada cliente, así que el compose sube los límites a 30 logins y 600 consultas públicas por minuto (`LOGIN_RATE_LIMIT` y `PUBLIC_RATE_LIMIT` en `.env`).

## 4. Mac con el simulador (VLAN 20)

1. Conectarla al Access Point. Sin DHCP en la VLAN 20, poner la IP a mano: `172.16.0.2`, `255.255.192.0`, router `172.16.0.1`.
2. Abrir `Sentinel.xcodeproj` (rama `feature/api-backend`) y correr el esquema **Debug** en un simulador. La app ya apunta a `http://172.16.64.2/api`.

## 5. Verificación

| # | Desde | Prueba | Resultado esperado |
| --- | --- | --- | --- |
| 1 | PC Back/Front | `Test-NetConnection 172.16.64.10 -Port 3306` | `TcpTestSucceeded : True` |
| 2 | PC Back/Front | `docker compose logs backend` | `Nest application successfully started` sin errores |
| 3 | Mac | `curl http://172.16.64.2/api/public/reports` | JSON con los reportes aprobados |
| 4 | Mac (navegador) | `http://172.16.64.2/` con `laura.mendez@sentinel.test` / `Admin#2026` | Panel con reportes y estadísticas |
| 5 | Mac (navegador) | `http://172.16.64.2/api/docs` | Swagger con el servidor `/api` |
| 6 | Simulador | Abrir la app sin sesión | Reportes verificados y estadísticas |
| 7 | Simulador | Registrarse, crear un reporte con foto y abrir *Mis reportes* | El reporte aparece en revisión con la foto |

## Publicar una versión nueva de las imágenes

Desde una Mac o PC con el código de `BackendEquipo1` y `FrontendEquipo1` uno junto al otro y `docker login` hecho:

```bash
SENTINEL_TAG=1.1 deploy/publicar-imagenes.sh
```

Construye las cuatro imágenes para `linux/amd64` y `linux/arm64` y las sube con la etiqueta indicada y `latest`. La URL de la API queda fija dentro del panel al construirlo (`PUBLIC_API_URL`, por defecto `http://172.16.64.2/api`); si cambia la IP del servidor hay que volver a publicar. En las PCs, cambien `SENTINEL_TAG` en `.env` y corran `docker compose pull` y `docker compose up -d`.
