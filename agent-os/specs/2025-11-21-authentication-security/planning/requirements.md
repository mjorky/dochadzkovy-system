# Requirements Gathering - Authentication & Security

## Decisions

### 1. Database Schema
- **Approach:** Separate `UserCredentials` table linked to `Zamestnanci`.
- **Table Name:** `UserCredentials` (or similar convention).
- **Relationship:** One-to-One with `Zamestnanci` (Employee ID as foreign key).
- **Columns:**
  - `ID` (PK)
  - `ZamestnanecID` (FK -> Zamestnanci.ID)
  - `Username` (String, Unique)
  - `PasswordHash` (String)
  - `LastLogin` (DateTime, Optional)

### 2. Login Identifier
- **Type:** Username (automatically generated, not user-chosen).
- **Format:** `firstname.lastname` (lowercase, no diacritics).
- **Normalization Logic:**
  - **Diacritics:** Must be stripped (Š -> s, á -> a, etc.).
  - **Multi-part Names:** Use ONLY the *first* part of the First Name and the *first* part of the Last Name.
    - Example: "Lucia Mária" "Boloz Šmotláková" -> `lucia.boloz`.
  - **Collisions:** Append incrementing number.
    - `milan.smotlak` (existing) -> `milan.smotlak1` -> `milan.smotlak2`.

### 3. Password Management
- **Initial Setup:** Admin sets initial password when creating/editing employee? Or default password? (Implicit: Admin manages it).
- **Recovery:** Admin resets password for users. No self-service email flow.

### 4. Roles & Permissions
- **Roles:**
  - **Admin:** (`IsAdmin = true`) - Full access.
  - **Regular:** (`IsAdmin = false`) - Access only to own data.
- **Deferred:** Manager role logic is skipped for now.

### 5. UI/UX
- **Login Screen:**
  - Simple form: Username, Password, Login button.
  - Error handling: "Invalid credentials".
  - Redirect to Dashboard/Home on success.
- **Design System:** Use Shadcn UI components.

## Technical Stack
- **Backend:** NestJS + Passport + JWT.
- **Database:** PostgreSQL + Prisma.
- **Frontend:** Next.js + NextAuth (or custom JWT handling per roadmap? Roadmap says "JWT Authentication Backend... implement login flow using Apollo Client").
  - *Note:* Roadmap specifies custom JWT implementation with Apollo Client, storing token in localStorage/cookie. We will follow this instead of NextAuth to keep it lightweight and consistent with the current GraphQL setup.
