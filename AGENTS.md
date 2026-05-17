# AGENTS.md

# Belux Backend — AI Collaboration & Engineering Guidelines

## Purpose

This document defines the engineering standards, architecture rules, coding conventions, and AI collaboration constraints for the Belux Backend project.

Any AI assistant, code generation tool, collaborator, or automation agent working on this repository MUST follow these rules.

The purpose of these guidelines is to ensure:

- Clean Architecture
- SOLID principles
- Scalability
- Maintainability
- Consistent code style
- Enterprise-grade backend standards
- Predictable project structure
- Security and performance best practices

---

# Core Stack

## Backend Framework

- NestJS
- TypeScript

## Database

- PostgreSQL

## ORM

- Prisma ORM

## Infrastructure

- Docker
- Docker Compose

## Package Manager

- pnpm

## Validation

- class-validator
- class-transformer

## API Documentation

- Swagger

---

# Architecture Rules

## Primary Architecture

This project follows:

- Modular Monolith Architecture
- Feature-first structure
- Clean Architecture principles
- SOLID principles

---

# Mandatory Project Structure

All new features MUST follow this structure:

```txt
src/
 ├── modules/
 │    ├── users/
 │    ├── auth/
 │    ├── payments/
 │    └── reconciliation/
 │
 ├── common/
 ├── config/
 ├── prisma/
 ├── shared/
 └── main.ts
```

---

# Feature Module Structure

Each module MUST follow this structure:

```txt
module-name/
 ├── controllers/
 ├── services/
 ├── repositories/
 ├── dto/
 ├── entities/
 ├── interfaces/
 ├── validators/
 ├── mappers/
 ├── enums/
 ├── constants/
 ├── module-name.module.ts
 ├── module-name.controller.ts
 └── module-name.service.ts
```

---

# Architecture Constraints

## Controllers

Controllers MUST:

- Only handle HTTP layer responsibilities
- Never contain business logic
- Never access Prisma directly
- Never perform data transformation logic
- Delegate all logic to services

### Correct

```ts
@Get()
findAll() {
  return this.usersService.findAll();
}
```

### Incorrect

```ts
@Get()
async findAll() {
  return this.prisma.user.findMany();
}
```

---

# Services

Services MUST:

- Contain business logic
- Coordinate repositories
- Handle validations not related to DTO validation
- Remain focused on a single responsibility

Services MUST NOT:

- Access HTTP request objects directly
- Contain SQL queries
- Become "god services"

---

# Repositories

Repositories MUST:

- Be the only layer accessing Prisma directly
- Encapsulate database logic
- Avoid business rules

### Correct Flow

```txt
Controller
   ↓
Service
   ↓
Repository
   ↓
Prisma
   ↓
Database
```

---

# DTO Rules

All request payloads MUST use DTOs.

Never use:

```ts
@Body() body: any
```

Always use:

```ts
@Body() dto: CreateUserDto
```

---

# Validation Rules

All DTOs MUST use:

- class-validator
- Validation decorators

Example:

```ts
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;
}
```

---

# SOLID Principles

## Single Responsibility Principle

Each class MUST have one responsibility only.

Avoid giant services handling:

- authentication
- emails
- reports
- payments
- notifications

inside the same class.

---

## Open/Closed Principle

Prefer:

- interfaces
- strategy patterns
- dependency injection

Avoid modifying stable classes repeatedly.

---

## Liskov Substitution Principle

Avoid unnecessary inheritance.

Prefer:

- composition
- providers
- services

---

## Interface Segregation Principle

Create small focused interfaces.

Avoid:

```ts
IUserEverythingService;
```

Prefer:

```ts
IUserReader;
IUserWriter;
```

---

## Dependency Inversion Principle

Always depend on abstractions.

Use:

- providers
- interfaces
- dependency injection

---

# Prisma Rules

## Prisma Access

Prisma MUST only be used inside repositories.

Never use Prisma directly inside:

- controllers
- guards
- interceptors

---

# Prisma Schema Rules

All models MUST:

- use explicit field names
- include timestamps when applicable
- use snake_case at DB level only if needed
- use camelCase in TypeScript

---

# Migration Rules

Never modify the database manually.

All schema changes MUST go through:

```bash
npx prisma migrate dev
```

---

# Naming Conventions

## Classes

Use PascalCase:

```txt
UsersService
CreateUserDto
PrismaService
```

---

## Variables

Use camelCase:

```ts
userRepository;
createdAt;
paymentStatus;
```

---

## Constants

Use UPPER_CASE:

```ts
MAX_RETRY_ATTEMPTS;
JWT_SECRET_KEY;
```

---

# Error Handling Rules

## NEVER

```ts
catch (e) {}
```

## ALWAYS

- Log errors properly
- Throw typed exceptions
- Use HttpException when needed

Example:

```ts
throw new NotFoundException('User not found');
```

---

# Logging Rules

Use structured logging.

Avoid:

- random console.log
- unnecessary logs

Use:

- Logger service
- contextual logs

---

# Environment Variables

All environment variables MUST be declared in:

```txt
.env
```

Never hardcode:

- secrets
- tokens
- database URLs
- credentials

---

# Security Rules

## NEVER

- Commit secrets
- Commit .env files
- Hardcode credentials
- Disable validation globally
- Trust incoming request data

---

# Swagger Rules

All endpoints MUST include:

- descriptions
- DTO documentation
- response documentation

Swagger is mandatory.

---

# API Response Standards

Responses should follow predictable structures.

Avoid inconsistent payloads.

Prefer:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {}
}
```

---

# Folder Rules

## NEVER create

```txt
helpers/
misc/
temp/
utils2/
```

without clear purpose.

---

# Shared Utilities

Reusable code belongs in:

```txt
src/common/
```

or

```txt
src/shared/
```

---

# Docker Rules

All services MUST run through Docker.

Preferred services:

- PostgreSQL
- Redis
- n8n
- future microservices

---

# Code Style Rules

## Mandatory

- ESLint
- Prettier
- strict TypeScript typing

---

# Forbidden Practices

## NEVER

- use `any`
- bypass validation
- place business logic in controllers
- duplicate logic
- create giant modules
- create circular dependencies
- use raw SQL unless strictly necessary
- directly manipulate Prisma in controllers

---

# Testing Philosophy

Preferred:

- unit tests for services
- integration tests for repositories
- e2e tests for APIs

---

# Scalability Rules

Code MUST be:

- modular
- composable
- maintainable
- reusable

Avoid overengineering.

---

# AI Assistant Rules

Any AI agent contributing code MUST:

- Respect existing architecture
- Preserve module boundaries
- Follow SOLID principles
- Use DTO validation
- Avoid introducing anti-patterns
- Avoid modifying unrelated files
- Prefer consistency over creativity
- Generate maintainable enterprise-grade code

---

# Recommended Development Workflow

## Local Development

```bash
docker compose up -d
pnpm install
pnpm start:dev
```

---

# Recommended Tooling

## Editor

- Cursor

## Extensions

- ESLint
- Prettier
- Prisma
- Docker
- REST Client
- Error Lens

---

# Recommended Backend Stack

| Layer      | Technology      |
| ---------- | --------------- |
| Framework  | NestJS          |
| ORM        | Prisma          |
| Database   | PostgreSQL      |
| Validation | class-validator |
| Docs       | Swagger         |
| Queue      | BullMQ          |
| Cache      | Redis           |
| Infra      | Docker          |

---

# Final Philosophy

This project prioritizes:

- clarity over cleverness
- maintainability over shortcuts
- scalability over temporary fixes
- consistency over personal preference

All generated or manually written code should be understandable, testable, modular, and production-ready.
