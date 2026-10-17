# Sistema de Gestión de Reportes y Roles — API

API REST construida con NestJS y MySQL para la gestión centralizada de usuarios, asignación de roles y seguimiento de reportes con estados de validación.

## Correr en local desde cero

Orden para levantar todo en tu computadora: 1) base de datos, 2) este backend, 3) el panel web ([FrontendEquipo1](https://github.com/TC2007B-451-Agosto-Diciembre-2026/FrontendEquipo1)) y 4) la app de iOS ([Sentinel](https://github.com/sentinelTec/Sentinel)). Cada repo explica su parte en su README.

### Requisitos

- Git
- Node.js 20 o superior (`node -v` para revisar)
- MySQL 8 corriendo en el puerto `3306`
  - Mac: `brew install mysql` y luego `brew services start mysql`
  - Windows: instalar MySQL Server 8 con el MySQL Installer

### 1. Clonar el repo

```bash
git clone https://github.com/TC2007B-451-Agosto-Diciembre-2026/BackendEquipo1.git
cd BackendEquipo1
```

### 2. Crear la base de datos

```bash
mysql -u root -p < db/schema.sql
mysql -u root -p < db/seed.sql
```

Si sale `Table 'roles' already exists`, ya tienes una base `sentinel` de antes. Bórrala y vuelve a correr los dos comandos (esto borra todos sus datos):

```bash
mysql -u root -p -e "DROP DATABASE sentinel"
```

### 3. Copiar las fotos de ejemplo

Las imágenes de los reportes de ejemplo se sirven desde la carpeta `uploads`:

```bash
cp -R db/seed-evidence uploads
```

En Windows (cmd): `xcopy db\seed-evidence uploads\ /E /I`

### 4. Crear el archivo `.env`

```bash
cp .env.example .env
```

Abre `.env` y cambia estas dos líneas:

```env
DATABASE_URL=mysql://root:TU_CONTRASEÑA@localhost:3306/sentinel
JWT_SECRET=una-cadena-larga-y-aleatoria
```

- En `DATABASE_URL` pon tu usuario y contraseña de MySQL. El host debe ser `localhost` (el `db` del ejemplo solo sirve dentro de Docker). Si la contraseña tiene caracteres especiales, escríbelos codificados (`#` → `%23`, `@` → `%40`).
- Para generar un `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Lo demás se queda como está.

### 5. Instalar y arrancar

```bash
npm install
npm run start:dev
```

Cuando termine de arrancar imprime `API en http://localhost:3000 y en http://<tu IP>:3000`. Deja esta terminal abierta.

### 6. Probar

- http://localhost:3000/public/reports debe regresar una lista de reportes en JSON.
- Swagger: http://localhost:3000/docs
- Login de prueba: `laura.mendez@sentinel.test` / `Admin#2026` (más cuentas abajo).

### Problemas comunes

| Mensaje | Solución |
| --- | --- |
| `Falta JWT_SECRET en .env` | No existe `.env` o le falta `JWT_SECRET` (paso 4) |
| `Access denied for user` / `ECONNREFUSED 127.0.0.1:3306` | Usuario o contraseña de `DATABASE_URL` incorrectos, o MySQL no está corriendo |
| `Unknown database 'sentinel'` | Falta el paso 2 |
| `EADDRINUSE :::3000` | Ya hay algo en el puerto 3000; ciérralo o cambia `PORT` en `.env` |
| Los reportes cargan pero sin fotos | Falta el paso 3 |

## Base de datos y datos de prueba

`db/schema.sql` crea la base `sentinel`, las tablas y los catálogos (rol 1 = admin, rol 2 = usuario; estado 1 = pendiente, 2 = aprobado, 3 = rechazado). `db/seed.sql` agrega datos ficticios con estas cuentas:

| Rol | Email | Contraseña |
| --- | --- | --- |
| admin | laura.mendez@sentinel.test | Admin#2026 |
| admin | ricardo.salas@sentinel.test | Admin#2026 |
| usuario | mafer.lopez@sentinel.test | Sentinel#2026 |
| usuario | jose.hernandez@sentinel.test | Sentinel#2026 |
| usuario | daniela.ruiz@sentinel.test | Sentinel#2026 |
| usuario | pedro.castillo@sentinel.test | Sentinel#2026 |

Cambien estas contraseñas antes de exponer el servidor.

Si la API corre detrás de nginx, pongan `TRUST_PROXY=1` en `.env` para que el límite de intentos de login use la IP real del cliente y no la del proxy. Para generar el hash y la sal de un usuario nuevo: `node scripts/hash-password.mjs "<contraseña>"`.

## Documentación Interactiva (Swagger)

Puedes acceder a la documentación interactiva OpenAPI y probar los endpoints desde el navegador en:
* **Swagger UI:** [http://localhost:3000/docs](http://localhost:3000/docs)
* **OpenAPI JSON:** [http://localhost:3000/docs-json](http://localhost:3000/docs-json)

## Principales Endpoints

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/auth/register`, `/auth/login`, `/auth/refresh` | Público (con límite de intentos) | Registro, login y renovación del token |
| GET, PATCH, DELETE | `/auth/me` | Usuario | Perfil propio |
| GET | `/public/reports`, `/public/reports/:id`, `/public/categories`, `/public/stats/summary`, `/public/stats/by-category` | Público (60 por minuto por IP) | Reportes aprobados sin datos del autor, categorías y estadísticas, para la app sin sesión |
| GET | `/reports` | Usuario / Admin | Usuario: solo aprobados, sin datos del autor. Admin: todos |
| GET | `/reports/mis-reportes` | Usuario | Reportes propios |
| GET | `/reports/:id` | Usuario / Admin | El propio, uno aprobado o cualquiera si es admin |
| POST | `/reports` | Usuario | Crea un reporte o señalamiento |
| PATCH, DELETE | `/reports/:id` | Autor / Admin | Edita (solo el autor) o borra (borrado lógico) |
| POST | `/reports/:id/image` | Autor | Adjunta una imagen JPG o PNG (máx. 5 MB) |
| GET | `/reports/:id/evidence` | Autor / Admin | Evidencias; las imágenes traen una URL firmada de 5 minutos |
| GET | `/evidence/:id?exp=&sig=` | URL firmada | Descarga la imagen |
| PATCH | `/reports/:id/status` | Admin | Cambia el estado y la probabilidad de fraude |
| GET, PATCH | `/reports/deleted`, `/reports/:id/restore` | Admin | Papelera |
| GET, PATCH | `/users`, `/users/:id/role` | Admin | Usuarios y cambio de rol |
| CRUD | `/roles`, `/categories`, `/validation-statuses` | Admin | Catálogos |
| GET | `/stats/*` | Usuario / Admin | Estadísticas |

## Estructura del Proyecto

```text
src/
├── database/          # Módulo y Pool de conexión a MySQL
├── roles/             # Módulo de roles (Controller, Service, Repository)
├── reportes/           # Módulo de reportes (Controller, Service, Repository)
├── auth/              # Guard, JWT y lógica de autenticación
└── main.ts            # Punto de entrada y configuración de Swagger
```
