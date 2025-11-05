# Raw Idea: Phase 2 - Work Records Read & Display

## Feature Description

Implement Phase 2 from the roadmap (items 6-8):

### Item 6: Work Records Read Query
Create GraphQL query that reads from per-user tables (t_{Name}_{Surname}), joins with Projects, CinnostTyp, HourType, HourTypes catalog tables, calculates hours (including overnight spans), and returns formatted work records.

### Item 7: Data Screen - Table Display
Build "Data" screen with table showing work records: date, absence type, project, productivity type, work type, start time, end time, hours, description, km, trip flag. Default filter: last 31 days. Display lock icon for locked records.

### Item 8: Date Range Filter
Add date picker filter (from date, to date) above table with "Last 31 days" default and "Show whole month" checkbox toggle that expands to full calendar month of start date. Filter updates table without page reload.

## Additional Requirements

- User wants advanced filtering capabilities for the work records table beyond basic date range filtering

## Project Context

- NestJS backend with GraphQL (Apollo Server v4, code-first approach)
- Next.js 14+ frontend with TailwindCSS and shadcn/ui (Tangerine theme)
- PostgreSQL database with existing schema
- Prisma ORM for database access
- This builds on Phase 1 which includes: database connection, GraphQL API setup, frontend setup, Apollo Client integration, and Employee Overview screen
