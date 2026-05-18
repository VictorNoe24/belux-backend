# Belux Backend

Backend API de Belux construido con NestJS, TypeScript y Prisma ORM sobre PostgreSQL.

El proyecto sigue una arquitectura modular orientada a escalabilidad, con validaciones por DTO, documentación con Swagger y una base de autenticación con JWT.

## Stack

- NestJS
- TypeScript
- Prisma ORM v6
- PostgreSQL
- JWT Authentication
- class-validator
- class-transformer
- Swagger
- ESLint
- Prettier
- pnpm

## Caracteristicas actuales

- Arquitectura modular por dominio
- Integracion con Prisma para acceso a base de datos
- Login con JWT
- Respuestas estandarizadas para exito y error
- Manejo centralizado de excepciones
- Seed inicial para usuario administrador
- Documentacion Swagger

## Estructura principal

```txt
src/
├── common/
├── config/
├── modules/
├── prisma/
├── shared/
└── main.ts
```

## Requisitos

- Node.js 20 o superior
- pnpm
- PostgreSQL

## Variables de entorno

Este proyecto utiliza un archivo `.env`.

Variables recomendadas:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/belux?schema=public"
PORT=3000
JWT_SECRET="super-secret-key"
JWT_EXPIRES_IN="1d"
```

## Instalacion

1. Instala dependencias:

```bash
pnpm install
```

2. Configura tu archivo `.env`.

3. Genera el cliente de Prisma:

```bash
pnpm exec prisma generate
```

4. Ejecuta migraciones:

```bash
pnpm exec prisma migrate dev
```

5. Ejecuta el seed inicial:

```bash
pnpm exec prisma db seed
```

## Usuario inicial del seed

El seed crea:

- Email: `admin@belux.com`
- Password: `123456`
- Role: `SUPER_ADMIN`
- Status: `ACTIVE`

## Scripts disponibles

```bash
pnpm start
pnpm start:dev
pnpm start:debug
pnpm start:prod
pnpm build
pnpm lint
pnpm test
pnpm test:e2e
pnpm test:cov
```

## Ejecutar el proyecto

Modo desarrollo:

```bash
pnpm start:dev
```

Build de produccion:

```bash
pnpm build
pnpm start:prod
```

## Base de datos

Comandos utiles de Prisma:

```bash
pnpm exec prisma generate
pnpm exec prisma migrate dev
pnpm exec prisma studio
pnpm exec prisma db seed
pnpm exec prisma validate
```

## Documentacion API

Swagger esta disponible en:

```txt
http://localhost:3000/docs
```

Con prefijo global activo:

```txt
http://localhost:3000/api
```

## Respuesta estandar

Respuesta exitosa:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Application is running",
  "data": "Hello World!"
}
```

Respuesta de error:

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "details": null,
    "source": "application"
  }
}
```

## Calidad y validaciones

El proyecto incluye:

- ESLint para reglas de calidad
- Prettier para formato
- Validacion global con `ValidationPipe`
- DTOs con `class-validator`

## Notas

- El proyecto usa Prisma 6.
- En Prisma 6 el `schema.prisma` sigue usando `url = env("DATABASE_URL")`.
- Si la extension de Prisma en VS Code marca eso como error, normalmente es un falso positivo relacionado con reglas de Prisma 7.

## Licencia

Proyecto privado de uso interno.
