# Project Review & Roadmap: Dochádzkový Systém

**Date:** November 30, 2025
**Project Type:** Full-Stack Attendance System
**Tech Stack:** Next.js (React), NestJS, Prisma, PostgreSQL, GraphQL (Apollo)

---

## 1. Executive Summary

The project is a modern, robust web application built on a solid, type-safe stack (TypeScript end-to-end). The separation of concerns between the Frontend (Next.js) and Backend (NestJS) is well-structured. The use of GraphQL provides a flexible API layer.

However, there is **one critical architectural design choice (Dynamic Tables)** that poses significant risks for scalability and maintainability. Addressing this should be the highest priority before adding complex new features.

---

## 2. Critical Architectural Improvements (High Priority)

### 🚨 The "Dynamic Tables" Anti-Pattern
**Current State:**
When a new employee is created, the system creates a new physical database table (e.g., `t_Jozef_Mrkvicka`).
**Why this is problematic:**
1.  **Scalability:** Database engines are designed to handle millions of rows, not thousands of tables.
2.  **Reporting:** Querying "all overtime for all employees" requires complex `UNION` queries over an unknown number of tables.
3.  **Maintenance:** Schema migrations (e.g., adding a `Note` column) must be applied to *every single employee table* via a loop, rather than one `ALTER TABLE` command.
4.  **Security:** It requires `queryRawUnsafe`, which bypasses some of Prisma's safety nets.

**Recommended Solution (Database Normalization):**
Migrate to a single `WorkRecords` table.

```prisma
// backend/prisma/schema.prisma

model WorkRecord {
  ID           BigInt      @id @default(autoincrement())
  EmployeeID   BigInt
  Employee     Zamestnanci @relation(fields: [EmployeeID], references: [ID])
  
  Date         DateTime    @db.Date
  StartTime    DateTime?   @db.Time
  EndTime      DateTime?   @db.Time
  
  ActivityTypeID BigInt
  ActivityType   CinnostTyp @relation(...)
  
  ProjectID    BigInt?
  Project      Projects?  @relation(...)
  
  Description  String?
  IsLocked     Boolean     @default(false)
  
  // Indexes for performance
  @@index([EmployeeID])
  @@index([Date])
  @@index([EmployeeID, Date])
}
```

---

## 3. Codebase Best Practices & Refactoring

### Backend (NestJS)
*   **Strict Typing for Environment Variables:** Use `joi` or `class-validator` to validate `.env` variables on startup (e.g., ensure `DATABASE_URL` or `JWT_SECRET` exists).
*   **Unified Error Handling:** Create a global **Exception Filter** in NestJS to catch all errors (Prisma errors, Validation errors) and return a standardized GraphQL error format.
*   **Logging:** Replace `console.log` with the built-in `Logger` service everywhere. Ensure structured logging (JSON) for production.
*   **Soft Deletes:** Instead of `DELETE` for employees or projects, add a `deletedAt` column. This preserves history for reports.

### Frontend (Next.js)
*   **Server Components vs Client Components:** Optimize the usage. Currently, many components might be Client Components unnecessarily. Move data fetching to Server Components where possible for better performance.
*   **Skeleton Loaders:** Instead of a simple "Loading..." text, use Skeleton UI components (shadcn/ui has these) to prevent layout shift.
*   **Form Management:** You are using `react-hook-form` and `zod` which is excellent. Keep this pattern.
*   **Apollo Cache Management:** Ensure that after Mutations (Create/Update), you are either updating the Cache manually or using `refetchQueries` (as you did in the Approvals fix) to keep the UI in sync.

---

## 4. Feature Roadmap (What's Missing?)

### Phase 1: User Experience & Notifications (Immediate Value)
1.  **Email Notifications:**
    *   When a request is created -> Email Manager.
    *   When a request is Approved/Rejected -> Email Employee.
    *   *Tech:* `nodemailer` + NestJS Queue (BullMQ) for background processing.
2.  **Dashboard Widgets:**
    *   "Who is working today?" (Active employees list).
    *   "My Remaining Vacation" (Visual progress bar).
    *   "Pending Approvals" (Counter).
3.  **Calendar View:**
    *   A visual monthly calendar showing absences (Vacation, Sick leave) for the whole team.

### Phase 2: Advanced Logic
4.  **Automatic Lunch Break:**
    *   Automatically deduct 30 mins if work duration > 6 hours.
5.  **Geo-Location / IP Restriction:**
    *   Allow clocking in only from specific IP addresses (office) or require GPS coordinates for remote work.
6.  **PDF Export Improvements:**
    *   Generate formal monthly attendance sheets signed by the system.

### Phase 3: Security & Ops
7.  **Audit Log:**
    *   Track *who* changed *what* and *when*. (e.g., "Admin changed Jozef's arrival time from 8:00 to 7:00").
8.  **2FA (Two-Factor Authentication):**
    *   Optional TOTP (Google Authenticator) for Admins.
9.  **Automated Backups:**
    *   Script to dump PostgreSQL database daily to S3/Local storage.

---

## 5. Testing Strategy

Currently, testing seems minimal.

1.  **Backend Integration Tests:** Use `jest` with a test database container to test complex flows (e.g., Approval flows).
2.  **E2E Tests:** Use **Playwright** or **Cypress** to test the critical "Happy Paths":
    *   Login -> Clock In -> Clock Out.
    *   Login -> Create Request -> Admin Approve.

## 6. Summary Checklist for "Production Ready"

- [ ] **MIGRATE DYNAMIC TABLES TO SINGLE TABLE** (Critical)
- [ ] Audit all `any` types in TypeScript and replace with strict interfaces.
- [ ] Setup a CI/CD pipeline (GitHub Actions / GitLab CI) to run `npm run lint` and `npm run build` on every push.
- [ ] Configure a production process manager (PM2) or Docker container for deployment.
- [ ] Enable Gzip/Brotli compression in Next.js.

---
*This document serves as a guide for future development. The priority should be fixing the database schema before the data volume grows too large.*
