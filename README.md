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

## Documentación Interactiva (Swagger)

Puedes acceder a la documentación interactiva OpenAPI y probar los endpoints desde el navegador en:
* **Swagger UI:** [http://localhost:3000/docs](http://localhost:3000/docs)
* **OpenAPI JSON:** [http://localhost:3000/docs-json](http://localhost:3000/docs-json)

##Principales Endpoints

| Método |     Ruta     | Autenticación |                     Descripción                 |
| ---    |      ---     |     ---       |                        ---                      |
| GET    |   `/roles`   | No            | Lista todos los roles disponibles               |
| POST   |   `/roles`   | No            | Registra un nuevo rol                           |
| GET    | `/roles/:id` | No            | Obtiene los detalles de un rol específico       |
| GET    |  `/reports`  | Bearer Token  | Obtiene la lista de reportes                    |
| POST   |  `/reports`  | Bearer Token  | Crea un nuevo reporte                           |
| GET    |`/reports/:id`| Bearer Token  | Consulta un reporte específico mediante su UUID |

## Estructura del Proyecto

```text
src/
├── database/          # Módulo y Pool de conexión a MySQL
├── roles/             # Módulo de roles (Controller, Service, Repository)
├── reportes/           # Módulo de reportes (Controller, Service, Repository)
├── auth/              # Guard, JWT y lógica de autenticación
└── main.ts            # Punto de entrada y configuración de Swagger
```
