# Work Records CRUD Operations (Phase 3)

## Feature Name
Work Records CRUD Operations (Phase 3)

## Description
Implement complete Create, Read, Update, Delete (CRUD) operations for work records in the attendance tracking system. This builds on Phase 2 (read-only display) by adding:

1. **Create Dialog & Mutation (Items 9 & 10)** - Allow users to add new work entries via dialog form with validation
2. **Update Dialog & Mutation (Item 11)** - Allow users to edit existing work entries, respecting lock status
3. **Delete Dialog & Mutation (Item 12)** - Allow users to delete work entries with confirmation, respecting lock status

## Implementation Plan
- Step 1: Create Dialog + Mutation (Items 9 & 10) - Build reusable form component, implement create mutation backend, connect frontend to backend, test creating new records
- Step 2: Update Dialog + Mutation (Item 11) - Reuse form component, add edit action to table rows, implement update mutation backend, test editing
- Step 3: Delete Dialog + Mutation (Item 12) - Add delete action to table rows, implement confirmation dialog, implement delete mutation backend, test deletion

## Context
This is Phase 3 from the product roadmap. The system already has:
- NestJS GraphQL backend with PostgreSQL
- Next.js frontend with TailwindCSS and shadcn/ui
- Working read-only work records display (Phase 2)
- Per-user tables (t_{Name}_{Surname}) for storing work records
- Lock mechanism (ZamknuteK date field) preventing edits to old records

## Reference
See /Users/miro/Projects/dochadzkovy-system/agent-os/product/roadmap.md Phase 3 (lines 100-156)
