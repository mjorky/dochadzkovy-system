# Spec Requirements: Project Scaffolding & Database Connection

## Initial Description

Create the foundational structure for the attendance system application:
- NestJS backend with Prisma ORM
- Next.js frontend with App Router
- Connect to existing PostgreSQL database at localhost:5433 (postgres://dochadzka:dochadzka@localhost:5433/dochadzka)
- Verify end-to-end connectivity: frontend → backend → database

This is the first task in a 13-phase roadmap to modernize a legacy C# WPF attendance system to a modern web stack. The database schema already exists and must remain unchanged (no migrations yet, just connection verification).

## Requirements Discussion

### First Round Questions

**Q1:** I assume the project structure should have `/backend` and `/frontend` directories at the root of the repository. Is that correct, or would you prefer a different structure (like monorepo with packages/apps)?

**Answer:** `/backend` and `/frontend` directories at the root.

**Q2:** For Prisma schema generation, I'm assuming we should use `prisma db pull` to auto-generate the schema from your existing database. Should we also auto-generate types for the per-user tables (t_{FirstName}_{LastName}) and views, or focus only on core tables?

**Answer:** Use `prisma db pull` to auto-generate from existing database. This will automatically generate types for all tables including per-user tables and views.

**Q3:** For the backend GraphQL server, I'm thinking it should run on port 4000 (standard GraphQL convention). Should we use a different port, and do you want hot-reload/watch mode configured for development?

**Answer:** Port 4000 is correct. Yes, include hot-reload/watch mode for development.

**Q4:** For the Next.js frontend, should it run on the standard port 3000, and should it use the new App Router (not Pages Router)?

**Answer:** Port 3000 is correct. Yes, use App Router (confirmed in tech stack).

**Q5:** Should we include .env.example files in both projects showing the required environment variables (database URL, GraphQL endpoint, etc.)?

**Answer:** Yes, include .env.example in both projects.

**Q6:** For the health check proving end-to-end connectivity, I'm assuming a simple GraphQL query that hits the database (e.g., `{ health { status, database } }`). Should this be a REST endpoint instead, or both?

**Answer:** Include BOTH:
- GraphQL query: `{ health { status, database } }`
- REST endpoint: `GET /health` (for monitoring tools, load balancers)

**Q7:** For CORS configuration in the backend, should we allow `http://localhost:3000` for development, or do you need specific production domains configured now?

**Answer:** Allow `http://localhost:3000` and `http://127.0.0.1:3000` for development. Production CORS configuration will be handled in a future phase. Production readiness tracking created at `/Users/miro/Projects/dochadzkovy-system/docs/production-readiness.md`.

**Q8:** For the non-technical testing guide, should I assume Docker is already running with the database, or should the guide include instructions to start the database container?

**Answer:** Don't include Docker startup instructions. Just note that database must be available at `postgres://dochadzka:dochadzka@localhost:5433/dochadzka`.

**Q9:** Regarding the example-reference implementation - should I use it as inspiration for project structure/patterns, or would you prefer I build everything from scratch using official CLI scaffolding (NestJS CLI, create-next-app)?

**Answer:** Build from scratch using CLI scaffolding (NestJS CLI, Next.js create-next-app). Use `/Users/miro/Projects/dochadzkovy-system/example-reference` only as reference for patterns, don't blindly copy code.

**Q10:** I notice you have both npm (11.6.2) and pnpm (10.20.0) installed. Which package manager should I use for both projects?

**Answer:** pnpm (faster, more efficient, better practice).

**Q11:** What exactly should be IN SCOPE for this phase, and what should be explicitly OUT OF SCOPE? For example, should we include authentication, any data screens, or just the bare minimum infrastructure?

**Answer - IN SCOPE:**
- NestJS backend with GraphQL endpoint
- Prisma connected to database (schema auto-generated)
- Next.js frontend with basic landing page
- Health check proving connectivity (frontend → backend → database)
- Both projects start and communicate
- Simple testing guide

**Answer - OUT OF SCOPE:**
- No authentication/authorization
- No data screens (employee list, work records)
- No UI navigation/sidebar/menu
- No forms or user input
- No GraphQL mutations
- No complex styling
- No business logic

### Existing Code to Reference

**Similar Features Identified:**
- Path: `/Users/miro/Projects/dochadzkovy-system/example-reference`
- Contains one working UI screen with backend/frontend/database integration
- Should be used as reference for approach/patterns only, not as template to copy
- May not fully comply with final tech stack (noted to use as inspiration, not source of truth)

**Usage Guidelines:**
- Build new projects from scratch using official CLIs
- Reference example-reference for understanding patterns and approaches
- Don't blindly copy code from example-reference
- Use as validation that end-to-end flow works

### Visual Assets

**Files Provided:**
- `shadcn-config-file.txt`: Complete shadcn/ui theme configuration with Tangerine-inspired design

**Visual Insights:**
- **Theme Name**: "Tangerine" inspired design
- **Primary Color**: Orange (`oklch(0.6397 0.1720 36.4421)`)
- **Design System**: Complete shadcn/ui configuration with:
  - Light and dark mode support (`.dark` class)
  - Full color palette: background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring
  - Chart colors (5 variants)
  - Sidebar colors (full set)
- **Typography**:
  - Sans: Inter
  - Serif: Source Serif 4
  - Mono: JetBrains Mono
- **Border Radius**: 0.75rem (12px)
- **Shadow System**: Complete shadow scale from 2xs to 2xl
- **Reference Design**: https://tweakcn.com/editor/theme?theme=tangerine
- **Fidelity Level**: High-fidelity configuration file (exact CSS custom properties)
- **Implementation Note**: First version of theme exists in example-reference, but use this config file for accurate colors and values

## Requirements Summary

### Functional Requirements

**Backend (NestJS):**
- Initialize NestJS project using NestJS CLI
- Configure GraphQL code-first approach
- Integrate Prisma ORM
- Auto-generate Prisma schema using `prisma db pull` from existing database
- Connect to PostgreSQL at `postgres://dochadzka:dochadzka@localhost:5433/dochadzka`
- Implement health check GraphQL query: `{ health { status, database } }`
- Implement health check REST endpoint: `GET /health`
- Configure CORS for `http://localhost:3000` and `http://127.0.0.1:3000`
- Run on port 4000
- Enable hot-reload/watch mode for development
- Include .env.example with required variables

**Frontend (Next.js):**
- Initialize Next.js project using create-next-app with App Router
- Configure TypeScript
- Integrate Apollo Client for GraphQL
- Configure TailwindCSS
- Integrate shadcn/ui with Tangerine theme configuration
- Create basic landing page
- Call backend health check to prove connectivity
- Display health check results on landing page
- Run on port 3000
- Include .env.example with GraphQL endpoint

**Database Integration:**
- Prisma schema auto-generated from existing database
- No migrations (schema already exists)
- Support for per-user tables (t_{FirstName}_{LastName})
- Support for views (AllTData, ActiveProjects, ZamestnanciFullName)
- Database must remain unchanged

**Testing & Validation:**
- Simple non-technical testing guide
- Assumes database is already running
- Step-by-step verification of:
  - Backend starts successfully
  - Frontend starts successfully
  - Health check shows database connectivity
  - End-to-end flow works

### Reusability Opportunities

**Reference Implementation:**
- Example-reference at `/Users/miro/Projects/dochadzkovy-system/example-reference`
- Contains working backend/frontend/database integration
- Use as reference for:
  - Project structure patterns
  - Prisma configuration approach
  - GraphQL setup patterns
  - Apollo Client configuration
  - Overall integration approach

**Theme Configuration:**
- shadcn/ui Tangerine theme configuration provided
- Ready to apply to new Next.js project
- Supports light and dark modes
- Includes complete design token system

**Build Tools:**
- NestJS CLI v11.0.10 already installed
- Prisma CLI v6.18.0 already installed
- pnpm v10.20.0 for package management

### Scope Boundaries

**In Scope:**
- Project scaffolding (backend + frontend)
- Database connection via Prisma
- Schema auto-generation (no migrations)
- Health check endpoints (GraphQL + REST)
- Basic landing page with connectivity test
- Development environment configuration
- .env.example files
- Testing guide (non-technical)
- shadcn/ui theme setup with Tangerine design
- Hot-reload for development

**Out of Scope:**
- Authentication/authorization
- User management
- Data display screens (employees, work records)
- UI navigation/sidebar/menu
- Forms or user input
- GraphQL mutations
- Database migrations
- Complex styling or animations
- Business logic
- Production deployment configuration
- Docker setup instructions
- Multiple environments beyond development

### Technical Considerations

**Tech Stack Constraints:**
- Backend: NestJS v10+, TypeScript, GraphQL (code-first), Prisma ORM
- Frontend: Next.js 14+, TypeScript, Apollo Client, TailwindCSS, shadcn/ui
- Database: PostgreSQL 17 (existing, must not be modified)
- Package Manager: pnpm (not npm or yarn)
- Node.js: v24.7.0 (already installed)

**Database Constraints:**
- Database schema must remain unchanged
- No migrations in this phase
- Support legacy per-user table structure (t_{FirstName}_{LastName})
- Support existing views
- Connection string: `postgres://dochadzka:dochadzka@localhost:5433/dochadzka`

**Project Structure:**
- Monorepo with `/backend` and `/frontend` directories at root
- Separate package.json for each project
- Shared pnpm workspace (optional, but good practice)

**Development Experience:**
- Hot-reload/watch mode for backend
- Fast refresh for frontend (Next.js default)
- Both servers must run concurrently

**Integration Points:**
- Backend port: 4000
- Frontend port: 3000
- GraphQL endpoint: `http://localhost:4000/graphql`
- REST health check: `http://localhost:4000/health`
- CORS allows frontend to call backend

**Reference Materials:**
- Example implementation: `/Users/miro/Projects/dochadzkovy-system/example-reference`
- Theme reference: https://tweakcn.com/editor/theme?theme=tangerine
- Theme config: `/Users/miro/Projects/dochadzkovy-system/agent-os/specs/001-project-scaffolding-database-connection/planning/visuals/shadcn-config-file.txt`

**CLI Tools Available:**
- NestJS CLI v11.0.10
- Prisma CLI v6.18.0
- pnpm v10.20.0
- Node.js v24.7.0

**Phase Context:**
- First phase of 13-phase roadmap
- Foundation for future phases
- Goal: Minimal working infrastructure
- Next phases will build upon this foundation
