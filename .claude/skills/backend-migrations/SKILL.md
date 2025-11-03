---
name: Backend Migrations
description: Manage database schema migrations using Prisma, Drizzle ORM, or raw SQL with PostgreSQL. When creating, modifying, or reverting database migrations for databases you control. When working with Prisma schema files (schema.prisma) or Drizzle migration files. When adding new tables, columns, indexes, or constraints to the database schema. When implementing reversible migrations with up/down methods. When handling zero-downtime deployments or backwards-compatible schema changes. When working with existing fixed database schemas that cannot be modified (migrations may not be applicable). When creating or modifying database indexes on large tables. When separating schema changes from data migrations.
---

## When to use this skill

- When creating or editing Prisma schema files (schema.prisma)
- When generating or writing database migration files with Prisma or Drizzle
- When writing raw SQL migration scripts for schema changes
- When adding new tables, columns, relationships, or indexes to the database
- When modifying existing database schema (altering columns, adding constraints, etc.)
- When implementing rollback strategies for migrations
- When handling zero-downtime deployments with backwards-compatible schema changes
- When creating indexes on large tables that require careful consideration
- When separating schema migrations from data migrations
- When managing database migration version control and deployment order
- When working with Prisma Client generation or Drizzle schema definitions
- **NOTE:** When working with existing fixed database schemas that cannot be modified, migrations may not be applicable - instead focus on querying existing schema with appropriate TypeScript types

# Backend Migrations

This Skill provides Claude Code with specific guidance on how to adhere to coding standards as they relate to how it should handle backend migrations.

## Instructions

For details, refer to the information provided in this file:
[backend migrations](../../../agent-os/standards/backend/migrations.md)
