# Despliegue de SENTINEL en el laboratorio

Dos PCs con Windows y Docker Desktop, con las IPs del diseño en Packet Tracer (`propuesta_reto_original.pkt`). Todo va por HTTP, sin certificado.

| PC | IP | Máscara | Gateway | VLAN | Qué corre | Puerto que se abre |
| --- | --- | --- | --- | --- | --- | --- |
| Base de datos | 172.16.64.10 | 255.255.255.248 | 172.16.64.9 | 10 | `deploy/db` (MySQL 8.4) | 3306 |
| Back/Front | 172.16.64.2 | 255.255.255.248 | 172.16.64.1 | 30 | `deploy/app` (nginx, backend, panel) | 80 |
| Mac con simulador | 172.16.0.2 | 255.255.192.0 | 172.16.0.1 | 20 | Xcode y el simulador de iOS | – |

Direcciones que usa cada cliente:

- Panel web: `http://172.16.64.2/`
- API (panel y app iOS): `http://172.16.64.2/api`
- Documentación de la API (Swagger): `http://172.16.64.2/api/docs`. Se puede apagar con `SWAGGER=0` en `deploy/app/.env`.

## 1. En las dos PCs

1. Instalar [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/) con WSL 2 y Git.
2. Poner la IP fija (PowerShell como administrador; cambien `"Ethernet"` por el nombre de su adaptador, que sale en `Get-NetAdapter`):

   ```powershell
   New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 172.16.64.10 -PrefixLength 29 -DefaultGateway 172.16.64.9
   ```

   En la PC Back/Front: `-IPAddress 172.16.64.2 -PrefixLength 29 -DefaultGateway 172.16.64.1`.

3. Marcar la red como privada, para que el firewall de Windows no bloquee todo:

   ```powershell
   Set-NetConnectionProfile -InterfaceAlias "Ethernet" -NetworkCategory Private
   ```

4. Clonar los repos **uno junto al otro** en la misma carpeta (el compose de la app busca el frontend en `../../../FrontendEquipo1`):

   ```powershell
   git clone <url>/BackendEquipo1.git
   git clone <url>/FrontendEquipo1.git
   ```

   La PC de la base solo necesita `BackendEquipo1`.

Docker descarga imágenes y paquetes de npm la primera vez, así que hagan este paso con internet. Después ya no lo necesita.

## 2. PC de la base de datos (172.16.64.10)

```powershell
cd BackendEquipo1\deploy\db
copy .env.example .env
notepad .env
docker compose up -d
docker compose ps
```

En `.env` pongan contraseñas largas en `MYSQL_ROOT_PASSWORD` y `MYSQL_PASSWORD`. La primera vez se ejecutan `db/schema.sql` y `db/seed.sql`; cuando `docker compose ps` diga `healthy`, la base está lista.

Abrir el puerto en el firewall:

```powershell
New-NetFirewallRule -DisplayName "SENTINEL MySQL" -Direction Inbound -Protocol TCP -LocalPort 3306 -Action Allow -Profile Private
```

Nunca usen `docker compose down -v`: borra el volumen con la base.

## 3. PC Back/Front (172.16.64.2)

```powershell
cd BackendEquipo1\deploy\app
copy .env.example .env
notepad .env
docker compose up -d --build
docker compose ps
```

En `.env`:

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | `mysql://sentinel:<MYSQL_PASSWORD de la PC de la base>@172.16.64.10:3306/sentinel` |
| `JWT_SECRET` | Una cadena aleatoria larga (ver el comando abajo) |
| `PUBLIC_API_URL` | `http://172.16.64.2/api` (se fija dentro del panel al construirlo; si cambia, hay que volver a correr `--build`) |
| `FRONTEND_PATH` | `../../../FrontendEquipo1` |

Para generar `JWT_SECRET`:

```powershell
$b = New-Object byte[] 48; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)
```

Abrir el puerto en el firewall:

```powershell
New-NetFirewallRule -DisplayName "SENTINEL Web" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow -Profile Private
```

Las evidencias se guardan en el volumen `evidence_data`; sobreviven a `docker compose down` y a reconstruir las imágenes.

### Límite de intentos

Docker Desktop no conserva la IP real del cliente: el backend ve a todos los dispositivos como una sola IP. Por eso el compose sube los límites a 30 logins y 600 consultas públicas por minuto (`LOGIN_RATE_LIMIT` y `PUBLIC_RATE_LIMIT`). Se pueden cambiar en `.env`.

## 4. Mac con el simulador (VLAN 20)

1. Conectarla al Access Point. Mientras el router no tenga DHCP en la VLAN 20, configurar la IP a mano en *Ajustes del Sistema → Red → Wi-Fi → Detalles → TCP/IP*: IP `172.16.0.2`, máscara `255.255.192.0`, router `172.16.0.1`.
2. En Xcode, abrir `Sentinel.xcodeproj` y correr el esquema **Debug** en un simulador. La app ya apunta a `http://172.16.64.2/api` (`APIConfig.defaultBaseURL`); para probar contra otro servidor se puede poner `SENTINEL_API_URL` en *Edit Scheme → Run → Environment Variables*.
3. La excepción de ATS para HTTP en red local solo existe en Debug. Un build Release no podrá conectarse sin HTTPS.

## 5. Verificación, en este orden

| # | Desde | Prueba | Resultado esperado |
| --- | --- | --- | --- |
| 1 | PC Back/Front | `ping 172.16.64.10` y `Test-NetConnection 172.16.64.10 -Port 3306` | Responde y `TcpTestSucceeded : True` |
| 2 | PC Back/Front | `docker compose logs backend` | `Conectando a mysql://***@172.16.64.10:3306/sentinel` y `Nest application successfully started` |
| 3 | Mac | `curl http://172.16.64.2/api/public/reports` | JSON con los reportes aprobados |
| 4 | Mac (navegador) | `http://172.16.64.2/` e iniciar sesión con `laura.mendez@sentinel.test` | Panel con la lista de reportes |
| 4b | Mac (navegador) | `http://172.16.64.2/api/docs` | Swagger con el servidor `/api`; "Try it out" en `/public/categories` responde 200 |
| 5 | Panel | Cambiar el estado de un reporte | Se guarda y aparece al recargar |
| 6 | Simulador | Abrir la app sin sesión | Reportes verificados y estadísticas |
| 7 | Simulador | Registrarse, crear un reporte con foto y ver "Mis reportes" | El reporte aparece pendiente y con la foto |
| 8 | Panel | Ver el reporte nuevo | Aparece con la foto adjunta |

Si el paso 1 falla, revisen el ruteo (OSPF) y el firewall de Windows antes que Docker.
