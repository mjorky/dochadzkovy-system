# Employee Overview Feature - Initial Idea

## User Description

I want to implement items 2-5 from Phase 1 as they are interconnected. And when they are finished I can test the functionality as a whole. So please let's spec Employee Overview Feature with items:

- Item 2: GraphQL query to list employees
- Item 3: Navigation sidebar with menu items
- Item 4: Apollo Client integration to fetch employee data
- Item 5: Employee Overview Screen showing employee details

## Context

This is the second spec in the project. The first spec (001-project-scaffolding-database-connection) established the infrastructure:

- Backend NestJS with GraphQL on port 4000
- Frontend Next.js on port 3000
- Prisma ORM with 37 generated models including Employee
- Database: PostgreSQL at localhost:5433
- TailwindCSS v4 with shadcn/ui (Tangerine theme)
- Apollo Client configured
- Health check endpoints working

## Related Roadmap Items

- Item 2: GraphQL query to list employees
- Item 3: Navigation sidebar with menu items
- Item 4: Apollo Client integration to fetch employee data
- Item 5: Employee Overview Screen showing employee details

## Visual Assets

The user provided visual reference files showcasing the Tangerine theme for shadcn/ui:

- **shadcn-config-file.txt** - Complete theme configuration
- **Dashboard.html** - Dashboard layout example (primary reference for employee overview)
- **Cards.html** - Component examples with badges and buttons
- **Color Palette.html** - Complete color palette showcase
- **Mail.html** - Application layout example
- **Typography.html** - Typography scale and hierarchy

All visual files are located in: `planning/visuals/`

The spec-writer should reference these files when designing the employee overview screen, particularly the Dashboard.html for table layout and sidebar navigation patterns.
