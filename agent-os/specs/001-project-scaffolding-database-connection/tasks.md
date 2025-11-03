# Task Breakdown: Project Scaffolding & Database Connection

## Overview

**Total Tasks:** 47 sub-tasks across 6 major task groups
**Estimated Total Time:** 4-6 hours
**Spec Phase:** Phase 1 of 13-phase roadmap - Foundation infrastructure

## Task List

### Workspace & Environment Setup

#### Task Group 1: Project Foundation
**Dependencies:** None
**Estimated Time:** 30 minutes

- [ ] 1.0 Complete workspace configuration
  - [ ] 1.1 Create root `pnpm-workspace.yaml`
    - Define workspace packages: `packages: ['backend', 'frontend']`
    - Reference: pnpm workspace documentation
  - [ ] 1.2 Create root `.npmrc` configuration
    - Add `auto-install-peers=true`
    - Add `strict-peer-dependencies=false`
    - Ensures smooth dependency resolution
  - [ ] 1.3 Create root `.env.example` with documentation
    - Document that backend and frontend need separate .env files
    - Include links to backend/.env.example and frontend/.env.example
    - Note database connection requirements
  - [ ] 1.4 Update root `.gitignore`
    - Add `.env` to prevent credential commits
    - Add `node_modules/`
    - Add `dist/`, `build/`, `.next/`
    - Add `pnpm-lock.yaml` (will commit this)
  - [ ] 1.5 Create root `package.json` with workspace scripts
    - Add `dev:backend` script: `pnpm --filter backend dev`
    - Add `dev:frontend` script: `pnpm --filter frontend dev`
    - Add `dev:all` script for concurrent execution using `concurrently` package
    - Add `install` script for workspace dependency installation
    - Private: true (workspace root)

**Acceptance Criteria:**
- pnpm workspace properly configured
- Root-level scripts available for development
- .gitignore protects sensitive files
- .env.example provides clear documentation

**Reference:**
- Spec Section: "Package Manager and Workspace Configuration"
- Spec Section: "Development Scripts and Tooling"

---

### Backend NestJS Setup

#### Task Group 2: NestJS Project Initialization
**Dependencies:** Task Group 1
**Estimated Time:** 45 minutes

- [ ] 2.0 Complete NestJS backend setup
  - [ ] 2.1 Initialize NestJS project at `/backend` directory
    - Run: `pnpm dlx @nestjs/cli@11 new backend --package-manager pnpm --strict`
    - Verify NestJS CLI version 11.x
    - Enable strict TypeScript mode
  - [ ] 2.2 Install core backend dependencies
    - GraphQL: `@nestjs/graphql@^12 @nestjs/apollo@^12 @apollo/server@^4 graphql@^16`
    - Prisma: `@prisma/client@^6.18.0`
    - Config: `@nestjs/config@^3`
    - Validation: `class-validator@^0.14 class-transformer@^0.5`
  - [ ] 2.3 Install backend dev dependencies
    - Prisma CLI: `prisma@^6.18.0`
    - Types: `@types/node`
  - [ ] 2.4 Configure backend `package.json` scripts
    - `dev`: `nest start --watch` (hot-reload)
    - `build`: `nest build`
    - `start:prod`: `node dist/main`
    - `prisma:generate`: `prisma generate`
    - `prisma:pull`: `prisma db pull`
    - `prisma:studio`: `prisma studio`
  - [ ] 2.5 Create backend `.env.example`
    - `DATABASE_URL=postgres://dochadzka:dochadzka@localhost:5433/dochadzka`
    - `PORT=4000`
    - `NODE_ENV=development`
    - `CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173`
  - [ ] 2.6 Copy `.env.example` to `.env` for development
  - [ ] 2.7 Verify backend starts successfully
    - Run: `cd backend && pnpm dev`
    - Verify server runs on port 4000
    - Stop server after verification

**Acceptance Criteria:**
- NestJS project created with pnpm
- All dependencies installed successfully
- Scripts configured for development workflow
- .env.example provides complete configuration template
- Backend server starts without errors

**Reference:**
- Spec Section: "Backend NestJS Project Setup"
- Spec Section: "Environment Configuration Templates"

---

#### Task Group 3: Prisma Database Integration
**Dependencies:** Task Group 2
**Estimated Time:** 30 minutes

- [ ] 3.0 Complete Prisma setup and schema generation
  - [ ] 3.1 Initialize Prisma in backend
    - Run: `cd backend && pnpm prisma init`
    - Verify `prisma/schema.prisma` created
  - [ ] 3.2 Configure `schema.prisma` datasource
    - Set `provider = "postgresql"`
    - Set `url = env("DATABASE_URL")`
    - Keep default generator for Prisma Client
  - [ ] 3.3 Pull schema from existing database
    - Ensure PostgreSQL running at localhost:5433
    - Run: `cd backend && pnpm prisma db pull`
    - Verify schema includes all tables (catalog tables, per-user tables, views)
    - Verify per-user tables like `t_FirstName_LastName` are generated
    - Verify views like `AllTData`, `ActiveProjects`, `ZamestnanciFullName` are generated
  - [ ] 3.4 Generate Prisma Client
    - Run: `cd backend && pnpm prisma generate`
    - Verify `node_modules/@prisma/client` contains generated types
  - [ ] 3.5 Write 2-4 focused tests for Prisma connection
    - Test 1: Prisma Client instantiation succeeds
    - Test 2: Database connection works (e.g., query `Verzia` table count)
    - Test 3: Can read from a per-user table (if any exist)
    - Test 4: Can read from a view (e.g., `ZamestnanciFullName`)
  - [ ] 3.6 Run Prisma-specific tests only
    - Verify the 2-4 tests from 3.5 pass
    - Do NOT run entire test suite

**Acceptance Criteria:**
- Prisma schema auto-generated from existing database
- Schema includes all tables, per-user tables, and views
- Prisma Client generates successfully
- The 2-4 Prisma connection tests pass
- No database migrations created

**Reference:**
- Spec Section: "Prisma Database Integration"
- Example Reference: `/Users/miro/Projects/dochadzkovy-system/example-reference` for Prisma patterns

---

#### Task Group 4: GraphQL & REST Health Check Endpoints
**Dependencies:** Task Group 3
**Estimated Time:** 60 minutes

- [ ] 4.0 Complete GraphQL and REST health check implementation
  - [ ] 4.1 Configure GraphQL module in `app.module.ts`
    - Import `GraphQLModule.forRoot(ApolloDriverConfig)`
    - Use `ApolloDriver` from `@nestjs/apollo`
    - Enable `playground: true` for development
    - Set `autoSchemaFile: true` for code-first approach
    - Add `sortSchema: true`
  - [ ] 4.2 Configure CORS in `main.ts`
    - Parse `CORS_ORIGINS` from environment variable
    - Enable CORS with array of allowed origins
    - Allow credentials: true
    - Reference: example-reference CORS pattern
  - [ ] 4.3 Configure @nestjs/config module
    - Import `ConfigModule.forRoot({ isGlobal: true })`
    - Enable `.env` file loading
    - Make available globally
  - [ ] 4.4 Create `health` module
    - Generate: `nest g module health`
    - Generate: `nest g service health`
    - Generate: `nest g resolver health`
    - Generate: `nest g controller health`
  - [ ] 4.5 Create GraphQL ObjectType for health response
    - File: `src/health/dto/health.dto.ts`
    - Fields: `status: String!`, `database: String!`
    - Use `@ObjectType()` and `@Field()` decorators
  - [ ] 4.6 Implement health resolver for GraphQL query
    - File: `src/health/health.resolver.ts`
    - Create `@Query(() => HealthDto)` for `health` query
    - Inject Prisma Client
    - Query database: `await prisma.verzia.count()` or similar
    - Return `{ status: "ok", database: "connected" }` on success
    - Catch errors and return proper error structure
  - [ ] 4.7 Implement health controller for REST endpoint
    - File: `src/health/health.controller.ts`
    - Create `@Get('health')` endpoint
    - Inject Prisma Client
    - Query database to verify connectivity
    - Return JSON: `{ status: "ok", database: "connected", timestamp: new Date().toISOString() }`
    - Return 200 status on success
    - Return 503 status with error details on failure: `{ status: "error", database: "disconnected", message: "..." }`
  - [ ] 4.8 Inject Prisma Client into health service
    - Create PrismaService extending PrismaClient
    - Implement `onModuleInit()` to call `$connect()`
    - Make available for injection
  - [ ] 4.9 Write 2-6 focused tests for health endpoints
    - Test 1: GraphQL health query returns success when DB connected
    - Test 2: GraphQL health query handles DB connection failure
    - Test 3: REST /health endpoint returns 200 with valid response
    - Test 4: REST /health endpoint returns 503 on DB failure
    - Test 5: Health check timestamp is valid ISO8601 format
    - Test 6: Health service correctly uses Prisma Client
  - [ ] 4.10 Run health endpoint tests only
    - Run ONLY the 2-6 tests written in 4.9
    - Verify critical health check behaviors work
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- GraphQL endpoint accessible at `http://localhost:4000/graphql`
- GraphQL Playground enabled in development
- GraphQL `health` query returns proper response
- REST `/health` endpoint returns proper JSON with status codes
- CORS properly configured for frontend origins
- The 2-6 health endpoint tests pass
- Backend can query database successfully

**Reference:**
- Spec Section: "Health Check Implementation - GraphQL Query"
- Spec Section: "Health Check Implementation - REST Endpoint"
- Example Reference: `/Users/miro/Projects/dochadzkovy-system/example-reference/graphql-node-backend/src/server.ts` for Apollo Server patterns
- Example Reference: `/Users/miro/Projects/dochadzkovy-system/example-reference/graphql-node-backend/src/db.ts` for database connection patterns

---

### Frontend Next.js Setup

#### Task Group 5: Next.js Project Initialization with Theme
**Dependencies:** Task Group 1
**Estimated Time:** 60 minutes

- [ ] 5.0 Complete Next.js frontend setup
  - [ ] 5.1 Initialize Next.js project at `/frontend` directory
    - Run: `pnpm create next-app@latest frontend --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"`
    - Use App Router (not Pages Router)
    - Use TypeScript
    - Use TailwindCSS
    - Use src directory
  - [ ] 5.2 Install frontend dependencies
    - Apollo Client: `@apollo/client@^3 graphql@^16`
    - Icons: `lucide-react@^0.263`
  - [ ] 5.3 Verify TailwindCSS v4+ installed
    - Check `tailwindcss@^4.0.0` in package.json
    - If not v4+, upgrade: `pnpm add -D tailwindcss@latest`
  - [ ] 5.4 Install shadcn/ui CLI
    - Run: `cd frontend && pnpm dlx shadcn@latest init`
    - Choose: TypeScript = Yes
    - Choose: Style = New York
    - Choose: Base color = Neutral (will override with Tangerine)
    - Choose: CSS variables = Yes
    - Choose: src directory = Yes (already using)
    - Choose: Import alias = @/* (already configured)
  - [ ] 5.5 Apply complete Tangerine theme to `src/app/globals.css`
    - Replace entire contents with theme from `planning/visuals/shadcn-config-file.txt`
    - Verify `:root` variables include all Tangerine colors
    - Verify `.dark` variables include dark mode colors
    - Verify `@theme inline` section maps all CSS custom properties
    - Verify typography fonts: Inter, Source Serif 4, JetBrains Mono
    - Verify border radius: 0.75rem
    - Verify shadow system variables (2xs through 2xl)
  - [ ] 5.6 Install Tangerine theme fonts
    - Install: `pnpm add @fontsource/inter @fontsource/source-serif-4 @fontsource/jetbrains-mono`
    - Import fonts in `src/app/layout.tsx`
    - Apply font CSS classes to html element
  - [ ] 5.7 Configure frontend `package.json` scripts
    - Verify `dev`: `next dev` (port 3000 default)
    - Verify `build`: `next build`
    - Verify `start`: `next start`
    - Verify `lint`: `next lint`
  - [ ] 5.8 Create frontend `.env.example`
    - `NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql`
  - [ ] 5.9 Copy `.env.example` to `.env.local` for development
  - [ ] 5.10 Verify frontend starts successfully
    - Run: `cd frontend && pnpm dev`
    - Verify server runs on port 3000
    - Open browser to http://localhost:3000
    - Verify default Next.js page loads with Tangerine theme colors
    - Stop server after verification

**Acceptance Criteria:**
- Next.js 14+ with App Router initialized
- TailwindCSS v4+ configured
- shadcn/ui installed and initialized
- Complete Tangerine theme applied to globals.css
- Theme fonts installed and configured
- .env.example provides GraphQL endpoint configuration
- Frontend starts successfully on port 3000

**Reference:**
- Spec Section: "Frontend Next.js Project Setup"
- Spec Section: "Visual Design" for complete Tangerine theme
- Planning Visual: `/Users/miro/Projects/dochadzkovy-system/agent-os/specs/001-project-scaffolding-database-connection/planning/visuals/shadcn-config-file.txt`
- Example Reference: `/Users/miro/Projects/dochadzkovy-system/example-reference/frontend/app/` for App Router structure

---

#### Task Group 6: Apollo Client & Landing Page
**Dependencies:** Task Group 4 and Task Group 5
**Estimated Time:** 60 minutes

- [ ] 6.0 Complete Apollo Client integration and landing page
  - [ ] 6.1 Create Apollo Client configuration
    - File: `src/lib/apollo-client.ts`
    - Configure `ApolloClient` with `HttpLink` to GraphQL endpoint
    - Use `NEXT_PUBLIC_GRAPHQL_ENDPOINT` from env
    - Configure `InMemoryCache`
    - Enable SSR support for App Router
    - Reference: Apollo Client Next.js App Router documentation
  - [ ] 6.2 Create Apollo Provider wrapper
    - File: `src/providers/apollo-provider.tsx`
    - Create client component wrapping `ApolloProvider`
    - Use `makeClient()` function for client initialization
    - Handle client-side rendering properly
  - [ ] 6.3 Update root layout to include Apollo Provider
    - File: `src/app/layout.tsx`
    - Wrap `{children}` with `<ApolloProvider>`
    - Keep existing font configurations
    - Maintain metadata for title and description
  - [ ] 6.4 Create GraphQL health check query
    - File: `src/graphql/queries/health.ts`
    - Define `HEALTH_QUERY` using `gql` tag
    - Query: `query Health { health { status database } }`
    - Export typed query
  - [ ] 6.5 Create health check display component
    - File: `src/components/health-check.tsx`
    - Use `'use client'` directive (client component)
    - Import `useQuery` from Apollo Client
    - Query backend health check using `HEALTH_QUERY`
    - Display loading state: "Checking connection..."
    - Display error state: Red X icon with error message
    - Display success state: Green checkmark with status
    - Use Tangerine primary color (orange) for success state
    - Use lucide-react icons: `CheckCircle2`, `XCircle`, `Loader2`
    - Style with TailwindCSS using theme colors
  - [ ] 6.6 Create landing page
    - File: `src/app/page.tsx`
    - Server Component (default)
    - Display title: "Attendance System - Dochádzkový Systém"
    - Center content on page
    - Import and render `<HealthCheck />` component
    - Apply minimal styling with Tangerine theme
    - Use card layout with shadcn/ui design system
  - [ ] 6.7 Write 2-6 focused tests for frontend components
    - Test 1: HealthCheck component renders loading state initially
    - Test 2: HealthCheck shows success state when health query succeeds
    - Test 3: HealthCheck shows error state when health query fails
    - Test 4: Landing page renders with correct title
    - Test 5: Apollo Client configured with correct GraphQL endpoint
    - Test 6: Health query is properly typed
  - [ ] 6.8 Run frontend component tests only
    - Run ONLY the 2-6 tests written in 6.7
    - Verify critical component behaviors work
    - Do NOT run the entire test suite

**Acceptance Criteria:**
- Apollo Client properly configured for Next.js App Router
- Health check query defined and typed
- Landing page displays application title
- Health check component shows loading/success/error states
- Success state uses Tangerine primary color (orange)
- The 2-6 frontend component tests pass
- Visual design matches Tangerine theme

**Reference:**
- Spec Section: "Frontend Landing Page with Health Check Display"
- Example Reference: `/Users/miro/Projects/dochadzkovy-system/example-reference/frontend/app/` for Apollo Client patterns

---

### Integration & Testing

#### Task Group 7: End-to-End Integration Testing
**Dependencies:** All previous task groups (1-6)
**Estimated Time:** 45 minutes

- [ ] 7.0 Complete end-to-end integration and testing guide
  - [ ] 7.1 Test concurrent development workflow
    - Install root dependencies: `pnpm install` from root
    - Verify workspace links: backend and frontend
    - Start backend: `cd backend && pnpm dev` in terminal 1
    - Start frontend: `cd frontend && pnpm dev` in terminal 2
    - Verify both servers start without errors
    - Stop both servers
  - [ ] 7.2 Test root-level concurrent script
    - Install concurrently if not present: `pnpm add -D -w concurrently`
    - Update root `package.json` with `dev:all` script
    - Run: `pnpm dev:all` from root
    - Verify both backend and frontend start concurrently
    - Verify proper output from both servers
  - [ ] 7.3 Test full-stack health check flow
    - Ensure database running at localhost:5433
    - Start backend: `cd backend && pnpm dev`
    - Verify GraphQL Playground accessible at http://localhost:4000/graphql
    - Test GraphQL health query in Playground
    - Test REST health endpoint: `curl http://localhost:4000/health`
    - Start frontend: `cd frontend && pnpm dev`
    - Open browser to http://localhost:3000
    - Verify landing page loads with Tangerine theme
    - Verify health check shows green success state
    - Verify "connected" database status displays
  - [ ] 7.4 Test error handling
    - Stop PostgreSQL database temporarily (if possible)
    - Refresh frontend page
    - Verify health check shows red error state
    - Verify error message displays
    - Restart database
    - Refresh page
    - Verify health check recovers to green success state
  - [ ] 7.5 Review existing tests from Task Groups 3, 4, 6
    - Review 2-4 tests from Prisma integration (Task 3.5)
    - Review 2-6 tests from health endpoints (Task 4.9)
    - Review 2-6 tests from frontend components (Task 6.7)
    - Total existing tests: approximately 6-16 tests
  - [ ] 7.6 Analyze test coverage gaps for THIS spec only
    - Identify critical end-to-end workflows lacking coverage
    - Focus ONLY on gaps related to project scaffolding and database connection
    - Do NOT assess entire application test coverage
    - Prioritize integration points: frontend → backend → database
  - [ ] 7.7 Write up to 6 additional integration tests maximum
    - Add maximum of 6 new tests to fill identified critical gaps
    - Focus on end-to-end workflows and integration points
    - Examples:
      - Test 1: Frontend can successfully query backend GraphQL endpoint
      - Test 2: Backend CORS allows frontend origin
      - Test 3: Prisma Client connects to correct database URL
      - Test 4: Environment variables load correctly in both projects
      - Test 5: Health check timestamp format is valid
      - Test 6: GraphQL schema includes health query
  - [ ] 7.8 Run feature-specific tests only
    - Run ONLY tests related to this spec (from tasks 3.5, 4.9, 6.7, and 7.7)
    - Expected total: approximately 12-22 tests maximum
    - Do NOT run any other application tests
    - Verify all critical workflows pass
  - [ ] 7.9 Create non-technical testing guide
    - File: `/TESTING.md` at repository root
    - Write clear, step-by-step instructions
    - Include prerequisites section
    - Document pnpm installation if needed
    - Document .env file setup (copy examples)
    - Document dependency installation
    - Document starting backend server
    - Document starting frontend server
    - Document browser testing steps
    - Include expected results with descriptions
    - Add troubleshooting section for common issues:
      - Port already in use
      - Database not running
      - CORS errors
      - Missing environment variables
    - Use non-technical language
    - Add clear section headings

**Acceptance Criteria:**
- Both projects start concurrently without errors
- Full end-to-end connectivity verified: browser → frontend → backend → database
- Health check displays correct status on frontend
- Error states handled gracefully
- All feature-specific tests pass (approximately 12-22 tests total)
- No more than 6 additional integration tests added
- Testing guide provides clear instructions for non-technical users
- Troubleshooting section covers common issues

**Reference:**
- Spec Section: "Testing Guide for Non-Technical Users"
- Spec Section: "Development Scripts and Tooling"

---

## Execution Order

**Recommended implementation sequence:**

1. **Workspace & Environment Setup** (Task Group 1)
   - Foundation for both projects
   - Enables workspace-level scripts
   - 30 minutes

2. **Backend NestJS Setup** (Task Group 2)
   - Initialize backend project structure
   - Install dependencies
   - 45 minutes

3. **Prisma Database Integration** (Task Group 3)
   - Connect to existing database
   - Generate schema and types
   - 30 minutes

4. **GraphQL & REST Health Check Endpoints** (Task Group 4)
   - Complete backend functionality
   - Enable connectivity verification
   - 60 minutes

5. **Frontend Next.js Setup** (Task Group 5)
   - Initialize frontend project structure
   - Apply Tangerine theme
   - 60 minutes

6. **Apollo Client & Landing Page** (Task Group 6)
   - Connect frontend to backend
   - Create health check display
   - 60 minutes

7. **Integration & Testing** (Task Group 7)
   - Verify end-to-end flow
   - Create testing guide
   - 45 minutes

**Total Estimated Time:** 4-6 hours

---

## Important Constraints

### Testing Philosophy
- **Focused Testing**: Each task group writes 2-6 focused tests maximum during development
- **Test-Driven**: Start each group with writing tests (x.1 sub-task), end with running ONLY those tests
- **No Full Suite**: Never run entire test suite during development phases
- **Integration Tests**: Task Group 7 adds maximum 6 additional tests for critical integration gaps
- **Feature-Specific**: Final test run includes ONLY tests for this spec (12-22 tests total)

### Technical Constraints
- **Package Manager**: Use pnpm exclusively, never npm or yarn
- **Database**: Connect to existing schema, no migrations allowed
- **Ports**: Backend on 4000, Frontend on 3000
- **Node Version**: v24.7.0 (already installed)
- **CLI Versions**: NestJS v11, Prisma v6.18.0, pnpm v10.20.0

### Scope Boundaries
- **In Scope**: Infrastructure, connectivity verification, basic landing page
- **Out of Scope**: Authentication, data screens, business logic, navigation, forms, mutations, production config

### Reference Materials
- **Example Implementation**: `/Users/miro/Projects/dochadzkovy-system/example-reference` (use for patterns, don't copy)
- **Theme Config**: Complete Tangerine theme in `planning/visuals/shadcn-config-file.txt`
- **Production Tracking**: `/Users/miro/Projects/dochadzkovy-system/docs/production-readiness.md`

---

## Task Verification Checklist

Use this checklist to verify completion of each major task group:

- [ ] **Task Group 1**: Root workspace configured, scripts work, .gitignore protects files
- [ ] **Task Group 2**: NestJS project created, dependencies installed, server starts on port 4000
- [ ] **Task Group 3**: Prisma schema generated from database, includes all tables/views, 2-4 tests pass
- [ ] **Task Group 4**: GraphQL Playground accessible, REST /health works, CORS configured, 2-6 tests pass
- [ ] **Task Group 5**: Next.js App Router initialized, Tangerine theme applied, fonts loaded, server starts on port 3000
- [ ] **Task Group 6**: Apollo Client integrated, health check component displays status, landing page complete, 2-6 tests pass
- [ ] **Task Group 7**: Both servers start concurrently, browser shows green health check, TESTING.md created, 12-22 total tests pass

---

## Success Criteria

**This specification is complete when:**

1. Developer can run `pnpm install` from root to set up entire workspace
2. Developer can run `pnpm dev:all` to start both servers concurrently
3. Backend runs on port 4000 with hot-reload enabled
4. Frontend runs on port 3000 with Tangerine theme applied
5. GraphQL Playground accessible at http://localhost:4000/graphql
6. REST health check accessible at http://localhost:4000/health
7. Browser at http://localhost:3000 shows:
   - Application title: "Attendance System - Dochádzkový Systém"
   - Green checkmark with "connected" status (when DB running)
   - Tangerine theme colors (primary orange)
8. Prisma schema includes all tables, per-user tables, and views from existing database
9. Non-technical user can follow TESTING.md to verify everything works
10. All feature-specific tests pass (12-22 tests covering Prisma, health endpoints, frontend components, and integration)
11. No database schema changes made
12. Both projects use pnpm workspace configuration
13. .env.example files provide complete configuration templates

**Phase 1 foundation is established and ready for Phase 2 development.**
