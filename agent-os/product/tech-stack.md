# Tech Stack

## Overview
This document defines the complete technical stack for the Attendance System modernization project. The stack modernizes the legacy C# WPF desktop application to a web-based architecture using TypeScript across the entire stack while preserving the proven database schema and business logic.

## Architecture Philosophy
- **Type Safety End-to-End:** TypeScript on backend (NestJS) and frontend (Next.js) with GraphQL providing typed API layer
- **Legacy Compatibility:** Database schema remains unchanged to enable zero-risk migration from C# WPF application
- **Proven Patterns:** Preserve per-user table architecture and overtime calculation logic from legacy system
- **Modern DX:** Developer experience prioritized with hot reload, type checking, and modern tooling
- **Incremental Testability:** Each feature should be deployable and testable in isolation

---

## Backend Stack (NestJS)

### Core Framework
- **Framework:** NestJS v10+
  - Modular architecture with decorators
  - Dependency injection built-in
  - Built on Express (default) or Fastify
  - Excellent TypeScript support

- **Language:** TypeScript (strict mode enabled)
  - Type safety across resolvers, services, and database layers
  - Interfaces for DTOs and entities
  - Enums for catalogs (CinnostTyp, HourType, NadcasyTyp, ZamestnanecTyp)

### API Layer
- **API Protocol:** GraphQL (code-first approach)
  - **Library:** `@nestjs/graphql` with Apollo Server integration
  - **Schema Generation:** Code-first using TypeScript decorators (`@ObjectType`, `@Field`, `@Query`, `@Mutation`)
  - **Type Definitions:** Auto-generated schema.graphql from TypeScript classes
  - **Validation:** Class-validator decorators on input DTOs
  - **Error Handling:** Structured GraphQL errors with error codes

- **Real-time:** GraphQL Subscriptions via WebSocket
  - For live updates to work records and overtime changes (Phase 2)
  - Uses `subscriptions-transport-ws` or newer `graphql-ws` protocol

### Database Layer
- **Database:** PostgreSQL (version 15+)
  - Unchanged from legacy system
  - Per-user tables: `t_{FirstName}_{LastName}` (e.g., `t_Anna_Lovasova`)
  - Union view: `AllTData` aggregates all per-user tables
  - Views: `ActiveProjects`, `ZamestnanciFullName`

- **ORM:** Prisma (recommended) OR Drizzle
  - **Prisma:**
    - Best TypeScript developer experience
    - Type-safe query builder
    - Migration system with `prisma migrate`
    - Prisma Studio for database inspection
    - `@prisma/client` auto-generated types
  - **Drizzle (alternative):**
    - Lighter weight, more flexible
    - SQL-like query builder
    - Better for dynamic table names (per-user tables)
    - Drizzle Kit for migrations
  - **Raw SQL:** Required for dynamic per-user table operations (`CREATE TABLE`, `RENAME TABLE`, `DROP TABLE`, union view regeneration)

- **Connection Pooling:** Built-in via Prisma or `pg-pool`

### Data Access Patterns
- **Static Tables:** Use ORM (Prisma/Drizzle) for standard CRUD
  - `Zamestnanci`, `Projects`, `CinnostTyp`, `HourType`, `HourTypes`, `Nadcasy`, etc.
- **Dynamic Per-User Tables:** Use raw SQL with parameterized queries
  - Table name computed from employee name (diacritics removed)
  - View regeneration via `CREATE OR REPLACE VIEW AllTData AS ...`
- **Views:** Read-only queries via ORM or raw SQL
  - `ActiveProjects`, `ZamestnanciFullName`, `AllTData`

### Testing
- **Framework:** Jest (built into NestJS)
  - Unit tests for services and resolvers
  - Integration tests for database operations
  - E2E tests for GraphQL endpoints
- **Test Database:** Separate PostgreSQL instance or Docker container
- **Mocking:** `@nestjs/testing` for dependency injection mocking

### Background Jobs (Phase 2)
- **Library:** `@nestjs/bull` (Redis-based queue) OR `@nestjs/schedule` (cron)
  - Automatic overtime calculation job (daily/nightly)
  - Reconcile `Nadcasy` entries based on work records and `FondPracovnehoCasu` thresholds

### Security & Authentication (Phase 2)
- **Authentication:** JWT tokens
  - `@nestjs/jwt` and `@nestjs/passport`
  - JWT strategy with token validation
- **Authorization:** Guards and decorators
  - Role-based access control (RBAC) based on `IsAdmin` and `Projects.Manager`
  - `@UseGuards(AuthGuard, RolesGuard)`
- **CORS:** Enabled for frontend origins
  - Configuration in `main.ts`

### Logging & Monitoring
- **Logging:** NestJS built-in logger or Winston
  - Structured JSON logs for production
  - Log levels: error, warn, info, debug
- **Error Tracking:** Sentry or similar (optional, Phase 2)

---

## Frontend Stack (Next.js)

### Core Framework
- **Framework:** Next.js 14+ (App Router)
  - React Server Components (RSC) for initial page loads
  - Client Components for interactive UI
  - File-based routing with `app/` directory
  - API routes not used (GraphQL handles all API)

- **Language:** TypeScript (strict mode enabled)
  - Type safety for components, hooks, and GraphQL responses
  - Interfaces for props and state
  - Auto-generated types from GraphQL schema (via codegen)

### GraphQL Client
- **Primary Option:** Apollo Client
  - `@apollo/client` package
  - InMemoryCache for client-side caching
  - `useQuery`, `useMutation`, `useSubscription` hooks
  - Automatic cache updates and refetching
  - DevTools extension for debugging

- **Alternative:** urql
  - Lighter weight than Apollo
  - Similar hooks API
  - Good TypeScript support
  - Document caching and normalized caching options

- **Code Generation:** `graphql-codegen`
  - Auto-generates TypeScript types from GraphQL schema
  - Typed hooks for queries and mutations
  - Configuration in `codegen.yml`

### UI & Styling
- **CSS Framework:** TailwindCSS v3+
  - Utility-first CSS
  - Configuration in `tailwind.config.ts`
  - Custom color palette and spacing
  - Dark mode support (optional)

- **Component Library:** shadcn/ui
  - Radix UI primitives (accessible, unstyled)
  - Copy-paste components (not npm package)
  - Components in `components/ui/` directory
  - Pre-styled with Tailwind
  - Includes: Button, Dialog, Select, Table, Form, Checkbox, etc.

### Forms & Validation
- **Form Library:** React Hook Form v7+
  - `useForm` hook for form state management
  - Minimal re-renders (better performance than Formik)
  - Native validation and custom validators
  - Integration with Zod for schema validation

- **Validation:** Zod
  - TypeScript-first schema validation
  - Schema definitions for form inputs and GraphQL variables
  - Type inference from schemas
  - Error messages customization

### State Management
- **Global State:** Zustand
  - Simpler than Redux (no boilerplate)
  - Hook-based API (`useStore`)
  - Middleware for persistence (local storage)
  - Used for: user preferences, filter state, UI state (modals, sidebars)

- **Server State:** Apollo Client cache OR urql cache
  - GraphQL data cached automatically
  - Optimistic updates for mutations
  - Cache invalidation strategies

### Data Fetching Patterns
- **Initial Load:** Server Components with `fetch` or Apollo `getClient().query()`
- **Client Interactions:** Apollo `useQuery` and `useMutation` hooks
- **Pagination:** Offset-based for work records (newest first)
  - Infinite scroll with `fetchMore` (Apollo) or manual pagination
- **Real-time Updates (Phase 2):** Apollo `useSubscription` for live data

### Testing
- **Unit/Integration Tests:** Vitest
  - Faster than Jest (uses esbuild)
  - Compatible with Jest API
  - Better TypeScript support
  - Run with `vitest` command

- **Component Tests:** React Testing Library
  - `@testing-library/react` and `@testing-library/user-event`
  - Test user interactions and accessibility
  - Mock GraphQL responses with `MockedProvider` (Apollo)

- **E2E Tests (Phase 2):** Playwright or Cypress
  - Full browser automation
  - Test critical user flows

### Internationalization
- **Library (Phase 2):** `next-intl` or `react-i18next`
  - English and Slovak language support
  - Translation files in `locales/en.json` and `locales/sk.json`
  - Context-aware translations
  - Number and date formatting (Slovak locale)

### Build & Deployment
- **Build:** `next build` (production optimized)
  - Static generation where possible
  - Server-side rendering for dynamic data
  - Bundle splitting and code optimization

- **Hosting:** Vercel (recommended) OR self-hosted Node.js
  - Vercel: Zero-config deployment with Git integration
  - Self-hosted: Docker container with Node 20+

---

## Database Schema (Unchanged)

### Core Tables
- `Zamestnanci` - Employee master data
- `ZamestnanecTyp` - Employment types with daily hour thresholds
- `Projects` - Project master data
- `Countries` - Country catalog
- `CinnostTyp` - Attendance/absence type catalog
- `HourType` - Productivity category catalog
- `HourTypes` - Work type catalog
- `NadcasyTyp` - Overtime type catalog
- `Nadcasy` - Overtime ledger with composite PK
- `Holidays` - Public holiday dates
- `Verzia` - Schema version tracking

### Dynamic Tables
- `t_{FirstName}_{LastName}` - Per-user work record tables
  - Created automatically on employee add
  - Renamed on employee name change
  - Columns: ID, CinnostTypID, StartDate, ProjectID, HourTypeID, HourTypesID, StartTime, EndTime, Description, km, Lock, DlhodobaSC

### Views
- `AllTData` - Union of all per-user tables with computed hours (overnight-aware)
- `ActiveProjects` - Projects with `AllowAssignWorkingHours = true`
- `ZamestnanciFullName` - Employees with title-aware full name composition

### Data Integrity
- Primary keys and foreign keys enforced
- Composite PK on `Nadcasy`: (ZamestnanecID, Datum, Typ, Odpocet)
- Unique constraint on `Projects.Number`
- Soft delete via `Zmazane` boolean (CinnostTyp)

---

## Development Tools

### Code Quality
- **Linting:** ESLint
  - `@typescript-eslint` parser and plugin
  - Next.js recommended rules
  - Prettier integration for formatting

- **Formatting:** Prettier
  - Auto-format on save (VSCode)
  - `.prettierrc` configuration

- **Type Checking:** TypeScript compiler (`tsc`)
  - Strict mode enabled
  - No implicit any
  - Strict null checks

### Version Control
- **Git:** Standard workflow
  - Feature branches
  - Conventional commits (optional)
  - Pre-commit hooks with Husky (optional)

### Development Environment
- **Node.js:** v20+ LTS
- **Package Manager:** npm (default) OR pnpm (faster, disk-efficient)
- **Database Client:** pgAdmin, Postico, or VSCode PostgreSQL extension
- **API Testing:** GraphQL Playground (built into Apollo Server) or Altair GraphQL Client

### Docker (Optional)
- **Development:** `docker-compose.yml` for PostgreSQL + backend + frontend
- **Production:** Multi-stage Dockerfile for backend and frontend

---

## Integration Architecture

### Communication Flow
```
Browser (Next.js)
  ↓ HTTP/GraphQL
NestJS Backend (Apollo Server)
  ↓ SQL (Prisma/Drizzle + raw SQL)
PostgreSQL (unchanged schema)
```

### Example-Reference Learnings
The working example in `/example-reference` demonstrates:
- **Frontend:** Next.js App Router with TailwindCSS and shadcn/ui components
- **Backend:** Node.js GraphQL server (similar to NestJS structure)
- **Database:** Direct PostgreSQL connection with successful schema integration
- **Key Success:** One complete UI screen (Data table) tested end-to-end with real database
- **Integration Pattern:**
  - GraphQL client in `lib/graphql/client.ts` using native `fetch`
  - Queries defined in `lib/graphql/queries.ts`
  - Custom hooks (e.g., `use-work-records.ts`) abstract data fetching
  - Mock data toggle for development without backend
  - CORS configuration required on backend

### CORS Configuration
Backend must allow frontend origin:
```typescript
// main.ts (NestJS)
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://production-domain.com'],
  credentials: true,
});
```

---

## Phase-Specific Stack Considerations

### Phase 1 (MVP - Legacy Feature Parity)
- Focus: Core CRUD, read queries, basic UI
- Skip: Authentication, subscriptions, background jobs
- Priority: Stable foundation with testable increments

### Phase 2 (Enhancements)
- Add: JWT authentication, RBAC, GraphQL subscriptions
- Add: Automated overtime calculation job
- Add: PDF generation (Work Report, Work List)
- Add: Internationalization (EN/SK switching)
- Add: Advanced admin features

---

## Non-Functional Requirements

### Performance
- **API Response Time:** < 200ms for read queries
- **Database Queries:** Indexed lookups, pagination for large datasets
- **Frontend Load Time:** < 2s initial page load (Lighthouse score 90+)

### Security
- **Transport:** HTTPS in production
- **Authentication:** JWT with short expiration (15min access, 7d refresh)
- **Authorization:** Row-level security via resolvers (check user ID and roles)
- **SQL Injection:** Prevented via ORM and parameterized raw queries
- **XSS:** React auto-escapes output

### Reliability
- **Database Migrations:** Versioned and idempotent
- **Error Handling:** Graceful degradation, user-friendly error messages
- **Logging:** Structured logs for debugging and monitoring

### Scalability (Future)
- **Backend:** Horizontal scaling with load balancer
- **Database:** Connection pooling, read replicas
- **Frontend:** CDN for static assets, edge caching

---

## Summary
This tech stack balances modern developer experience (TypeScript, NestJS, Next.js, GraphQL) with proven legacy architecture (per-user tables, unchanged schema). The example-reference validates the integration pattern. Each phase builds incrementally, enabling frequent testing by non-technical users.
