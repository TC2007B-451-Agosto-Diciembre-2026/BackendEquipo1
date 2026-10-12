# Sistema de Gestión de Reportes y Roles — API

API REST construida con NestJS y MySQL para la gestión centralizada de usuarios, asignación de roles y seguimiento de reportes con estados de validación.

## Requisitos

- Node.js 20 o superior
- MySQL 8.0+ corriendo localmente (puerto `3306`)

## Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env a partir del ejemplo y llenar JWT_SECRET y DATABASE_URL
cp .env.example .env

# 3. Iniciar servidor en modo desarrollo
npm run start:dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Despliegue en el laboratorio

Ver [deploy/DESPLIEGUE.md](deploy/DESPLIEGUE.md): una PC con la base de datos y otra con nginx, backend y panel web, todo con Docker.

## Base de datos y datos de prueba

```bash
mysql -u root -p < db/schema.sql
mysql -u root -p < db/seed.sql
```

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
