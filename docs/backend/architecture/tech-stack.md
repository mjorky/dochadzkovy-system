# NestJS (Backend) + Next.js (Frontend) + GraphQL
Backend (NestJS):
  - Framework: NestJS (v10+)
  - Language: TypeScript
  - API: GraphQL (code-first with @nestjs/graphql)
  - ORM: Prisma (best TypeScript DX) or Drizzle (lighter, more flexible)
  - Database: PostgreSQL (unchanged)
  - Testing: Jest (built into NestJS)
  - Real-time: GraphQL Subscriptions via WebSocket

Frontend (Next.js):
  - Framework: Next.js 14+ (App Router)
  - Language: TypeScript
  - GraphQL Client: Apollo Client or urql
  - UI: TailwindCSS + shadcn/ui (modern, accessible)
  - Forms: React Hook Form + Zod
  - State: Zustand (simpler than Redux)
  - Testing: Vitest + React Testing Library