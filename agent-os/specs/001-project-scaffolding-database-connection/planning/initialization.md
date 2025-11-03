# Spec Initialization: Project Scaffolding & Database Connection

## Feature Name
Project Scaffolding & Database Connection

## User Description
Create the foundational structure for the attendance system application:
- NestJS backend with Prisma ORM
- Next.js frontend with App Router
- Connect to existing PostgreSQL database at localhost:5433 (postgres://dochadzka:dochadzka@localhost:5433/dochadzka)
- Verify end-to-end connectivity: frontend → backend → database

## Context
This is the first task in a 13-phase roadmap to modernize a legacy C# WPF attendance system to a modern web stack. The database schema already exists and must remain unchanged (no migrations yet, just connection verification).

## Tech Stack
From /Users/miro/Projects/dochadzkovy-system/agent-os/product/tech-stack.md:
- Backend: NestJS v10+, TypeScript, GraphQL (code-first), Prisma ORM
- Frontend: Next.js 14+, TypeScript, Apollo Client, TailwindCSS, shadcn/ui
- Database: PostgreSQL 17 (running in Docker)

## Reference Implementation
/Users/miro/Projects/dochadzkovy-system/example-reference

## Development Tools Already Installed
- Node.js v24.7.0
- npm 11.6.2
- NestJS CLI v11.0.10
- Prisma CLI v6.18.0
- pnpm v10.20.0

## Expected Outcome
- Working NestJS project with GraphQL API endpoint
- Working Next.js project that can call the backend
- Prisma successfully connected to existing database
- Simple health check query proves end-to-end connectivity
- Non-technical testing guide included

## Initialization Date
2025-11-03

## Spec Path
/Users/miro/Projects/dochadzkovy-system/agent-os/specs/001-project-scaffolding-database-connection
