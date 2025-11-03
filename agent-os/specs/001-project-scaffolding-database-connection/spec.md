# Specification: Project Scaffolding & Database Connection

## Goal
Create foundational NestJS backend and Next.js frontend with Prisma ORM, verify end-to-end connectivity from browser through GraphQL to PostgreSQL database, and establish development environment for Phase 1 of modernizing legacy C# WPF attendance system.

## User Stories
- As a developer, I want both backend and frontend projects scaffolded with proper tooling so that I can start building features immediately
- As a developer, I want to verify database connectivity through a health check so that I know the full stack is working before building business logic

## Specific Requirements

**Backend NestJS Project Setup**
- Initialize using NestJS CLI v11 at `/backend` directory with strict TypeScript
- Configure GraphQL code-first approach with Apollo Server integration
- Set up Prisma ORM with schema auto-generation via `prisma db pull` from existing database
- Run backend on port 4000 with hot-reload enabled for development
- Include CORS configuration allowing localhost:3000, 127.0.0.1:3000, localhost:5173, and 127.0.0.1:5173
- Create `.env.example` with DATABASE_URL, PORT, and CORS_ORIGINS
- Configure environment variable loading via @nestjs/config

**Frontend Next.js Project Setup**
- Initialize using create-next-app with Next.js 14+, App Router, TypeScript, and ESLint at `/frontend` directory
- Configure Apollo Client for GraphQL communication with backend
- Set up TailwindCSS v4+ with shadcn/ui component library using Tangerine theme configuration
- Apply complete Tangerine theme CSS custom properties to `app/globals.css` (primary orange color, Inter/Source Serif 4/JetBrains Mono fonts, 0.75rem radius)
- Run frontend on port 3000
- Create `.env.example` with NEXT_PUBLIC_GRAPHQL_ENDPOINT
- Install shadcn/ui CLI and initialize with Tangerine theme values

**Prisma Database Integration**
- Connect to PostgreSQL at `postgres://dochadzka:dochadzka@localhost:5433/dochadzka`
- Execute `prisma db pull` to auto-generate schema from existing database including per-user tables (t_{FirstName}_{LastName}), views (AllTData, ActiveProjects, ZamestnanciFullName), and all catalog tables
- Configure Prisma client generation with proper TypeScript types
- Ensure no database migrations are created (schema must remain unchanged)
- Add Prisma Studio access for database inspection during development

**Health Check Implementation - GraphQL Query**
- Create GraphQL query `health` returning object with `status: String!` and `database: String!` fields
- Implement NestJS resolver that queries database (e.g., `SELECT 1` or count from Verzia table)
- Return `{ status: "ok", database: "connected" }` on success
- Return proper error structure on database connection failure
- Make query accessible at `http://localhost:4000/graphql` with GraphQL Playground enabled

**Health Check Implementation - REST Endpoint**
- Create REST endpoint `GET /health` using NestJS controller
- Query database to verify connectivity
- Return JSON `{ status: "ok", database: "connected", timestamp: ISO8601 }` on success with 200 status
- Return JSON `{ status: "error", database: "disconnected", message: "error details" }` with 503 status on failure
- Enable endpoint for monitoring tools and load balancers

**Frontend Landing Page with Health Check Display**
- Create basic landing page at `/app/page.tsx` using Next.js Server Components
- Display application title "Attendance System - Dochádzkový Systém"
- Call backend health check GraphQL query using Apollo Client useQuery hook
- Display health status visually (green checkmark for success, red X for failure)
- Show database connection status and timestamp
- Include minimal styling using Tangerine theme colors (primary orange for success state)
- Display loading state while health check executes

**Package Manager and Workspace Configuration**
- Use pnpm as exclusive package manager for both projects
- Create root `pnpm-workspace.yaml` defining backend and frontend as workspace packages
- Create root `.npmrc` with `auto-install-peers=true` and `strict-peer-dependencies=false`
- Document pnpm installation and usage in testing guide
- Ensure lockfile (pnpm-lock.yaml) is committed

**Environment Configuration Templates**
- Backend `.env.example` with DATABASE_URL=postgres://dochadzka:dochadzka@localhost:5433/dochadzka, PORT=4000, NODE_ENV=development, CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
- Frontend `.env.example` with NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
- Root `.env.example` explaining that projects require separate .env files
- Add `.env` to `.gitignore` to prevent credential commits

**Development Scripts and Tooling**
- Backend scripts: `pnpm dev` (hot-reload), `pnpm build`, `pnpm start:prod`, `pnpm prisma:generate`, `pnpm prisma:pull`, `pnpm prisma:studio`
- Frontend scripts: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`
- Root scripts: `pnpm dev:backend`, `pnpm dev:frontend`, `pnpm dev:all` (concurrent execution)
- Document that backend must start before frontend for health check to work

**Testing Guide for Non-Technical Users**
- Create step-by-step guide at root `TESTING.md` with screenshots or clear instructions
- Prerequisites section noting database must be running at localhost:5433
- Step 1: Install pnpm globally if not present (`npm install -g pnpm`)
- Step 2: Copy `.env.example` to `.env` in both backend and frontend directories
- Step 3: Install dependencies (`pnpm install` from root)
- Step 4: Start backend (`cd backend && pnpm dev`)
- Step 5: Start frontend in separate terminal (`cd frontend && pnpm dev`)
- Step 6: Open browser to `http://localhost:3000` and verify green health check
- Troubleshooting section for common issues (port conflicts, database not running, CORS errors)

## Visual Design

**`planning/visuals/shadcn-config-file.txt`**
- Apply complete CSS custom properties structure to frontend `app/globals.css`
- Use primary orange color `oklch(0.6397 0.1720 36.4421)` for primary UI elements and health check success state
- Configure typography: `--font-sans: Inter`, `--font-serif: Source Serif 4`, `--font-mono: JetBrains Mono`
- Set border radius to `--radius: 0.75rem` for all shadcn/ui components
- Include full light mode color palette (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, sidebar variants)
- Include full dark mode color palette with `.dark` class selector
- Apply `@theme inline` section with all color mappings and radius calculations
- Add shadow system variables (2xs through 2xl) for consistent elevation

## Existing Code to Leverage

**Apollo Server Setup Pattern from example-reference**
- Reference `/example-reference/graphql-node-backend/src/server.ts` for Apollo Server v4 initialization pattern with Express middleware
- Adapt CORS configuration approach allowing multiple origins
- Use `expressMiddleware` integration for NestJS context pattern
- Replicate health check endpoint structure but migrate to NestJS decorators

**Database Connection Pattern from example-reference**
- Reference `/example-reference/graphql-node-backend/src/db.ts` for PostgreSQL pool setup and DATE type parser
- Use `types.setTypeParser(1082, (val: string) => val)` to prevent date parsing issues
- Adapt connection string loading from environment variables pattern
- Replicate error handling for pool connection failures

**Next.js App Router Structure from example-reference**
- Reference `/example-reference/frontend/app/` structure for App Router layout pattern
- Adapt `globals.css` structure but replace with Tangerine theme values
- Use similar file organization: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Reference package.json for Next.js 16 and React 19 version compatibility

**shadcn/ui CSS Structure from example-reference**
- Reference `/example-reference/frontend/app/globals.css` for `@theme inline` Tailwind v4 pattern
- Maintain `@custom-variant dark` approach for dark mode
- Keep `@layer base` body styling structure
- Replace all color values with Tangerine theme colors from provided config file

**TypeScript Configuration from example-reference**
- Reference strict TypeScript setup in both frontend and backend
- Use similar tsconfig.json with strict mode enabled
- Maintain consistent import/export patterns
- Follow type-safe query patterns for database operations

## Out of Scope
- Authentication or authorization (JWT, sessions, guards)
- Any actual data screens displaying employees, work records, or projects
- UI navigation components (sidebar, header, menu, breadcrumbs)
- Forms for user input or data entry
- GraphQL mutations (only queries for health check)
- Database schema migrations or modifications
- Complex styling, animations, or responsive design beyond basic layout
- Business logic for overtime calculation, work record validation, or employee management
- Internationalization or language switching (EN/SK support deferred to Phase 2)
- Production deployment configuration (Docker, CI/CD, hosting)
