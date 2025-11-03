---
name: Backend Queries
description: Write efficient and secure database queries using Prisma Client, Drizzle ORM, or raw SQL with node-postgres (pg) for PostgreSQL. When writing database queries in NestJS services, GraphQL resolvers, or repository files. When implementing data fetching logic with Prisma's query API, Drizzle's query builder, or raw parameterized SQL queries. When working with existing fixed database schemas using pg Pool connections. When optimizing queries to prevent N+1 problems using eager loading, joins, or SQL UNION. When implementing parameterized queries to prevent SQL injection. When selecting specific fields instead of fetching all data. When implementing transactions for related database operations.
---

## When to use this skill

- When writing database queries using Prisma Client methods (findMany, findUnique, create, update, etc.)
- When using Drizzle ORM's query builder for database operations
- When writing raw SQL queries with node-postgres (pg) using pool.query() or db.query()
- When using parameterized queries with $1, $2 placeholders to prevent SQL injection
- When working with existing fixed database schemas that can't be modified via ORM
- When implementing complex SQL queries with JOINs, UNION ALL, or dynamic SQL generation
- When implementing eager loading or joins to prevent N+1 query problems
- When optimizing queries by selecting only needed fields instead of SELECT *
- When wrapping related database operations in transactions for data consistency
- When implementing query timeouts to prevent runaway queries
- When caching results of complex or frequently-executed queries
- When working with database query logic in NestJS services, Apollo Server resolvers, or repository files
- When configuring pg type parsers for custom PostgreSQL data types (e.g., dates)

# Backend Queries

This Skill provides Claude Code with specific guidance on how to adhere to coding standards as they relate to how it should handle backend queries.

## Instructions

For details, refer to the information provided in this file:
[backend queries](../../../agent-os/standards/backend/queries.md)
