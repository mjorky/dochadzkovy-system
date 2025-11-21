# Specification: Authentication & Security

## Goal
Protect the application with secure login and role-based permissions. Implement a dedicated credentials storage mechanism, automated username generation, and a JWT-based authentication flow.

## User Stories
1. **As a User**, I want to log in with my generated username and password so I can access the application securely. Password can be changed by admin.
2. **As a User**, I expect to be redirected to the main dashboard upon successful login and see only my own data (if I am a regular employee).
3. **As an Admin**, I want usernames to be automatically generated based on employee names to ensure consistency (`firstname.lastname`).
4. **As an Admin**, I want to reset passwords for employees who have forgotten them.
5. **As an Admin**, I need full access to all parts of the system, while regular users are restricted to their own records. Also the screens that are under Admin button are not availabe to non-admin users.

## Core Requirements

### 1. Database Schema
- **New Table:** `UserCredentials`
    - `ID`: BigInt (PK, Auto-increment)
    - `ZamestnanecID`: BigInt (FK -> `Zamestnanci.ID`, Unique constraint to ensure 1:1)
    - `Username`: String (Unique, Varchar)
    - `PasswordHash`: String (Varchar, for storing bcrypt/argon2 hashes)
    - `LastLogin`: DateTime (Nullable)
- **Relation:** One-to-One relationship with `Zamestnanci`.

### 2. Username Generation Logic
- **Trigger:** Occurs when an Admin creates a new employee or updates an employee's name (if username doesn't exist).
- **Format:** `firstname.lastname` (lowercase, stripped diacritics).
- **Normalization Rules:**
    - **Diacritics:** Convert to ASCII (e.g., `Š` -> `s`, `á` -> `a`).
    - **Multi-part Names:** Take ONLY the first part.
        - Example: `Lucia Mária` `Boloz Šmotláková` -> `lucia.boloz`.
    - **Collision Handling:** Append incrementing number starting from 1.
        - `milan.smotlak` (first)
        - `milan.smotlak1` (second)
        - `milan.smotlak2` (third)

### 3. Authentication Flow
- **Backend (NestJS):**
    - Use `@nestjs/passport` and `@nestjs/jwt`.
    - **Mutation:** `login(username, password)` returning `accessToken` (and optional `refreshToken` or just long-lived access for MVP).
    - **Guard:** `JwtAuthGuard` to protect all private queries/mutations.
    - **Decorators:** `@CurrentUser()` to extract user ID from token in resolvers.
- **Frontend (Next.js + Apollo):**
    - **Login Page:** New route `/login`. Simple form with Username/Password.
    - **Storage:** Store JWT in `localStorage` (or `httpOnly` cookie if preferred, but localStorage is simpler for Apollo setup described in roadmap).
    - **Middleware/Context:** Check for token presence. Redirect unauthenticated users to `/login`.
    - **Header:** Add `Authorization: Bearer <token>` to all GraphQL requests.
    - **Logout:** Clear storage and redirect to `/login`.

### 4. Role-Based Access Control (RBAC)
- **Roles:**
    - **Admin:** `Zamestnanci.IsAdmin = true`. Can execute all mutations (including employee management).
    - **Regular:** `Zamestnanci.IsAdmin = false`. Can only query/mutate their own `ZamestnanecID` data.
- **Implementation:**
    - Backend: Check `user.isAdmin` in critical resolvers.
    - Frontend: Hide "Admin" menu items for non-admin users.

## Design & UI
- **Login Screen:**
    - Centered card layout.
    - Fields: Username, Password.
    - Button: "Prihlásiť sa" (Log in).
    - Error Message: "Nesprávne prihlasovacie údaje" (Invalid credentials).
    - Branding: Simple, clean, using Shadcn UI components.

## Technical Considerations
- **Password Hashing:** Use `bcrypt` or `argon2` for hashing passwords before saving to `UserCredentials`.
- **Seeding:** Need a way to seed the initial Admin account since no one can log in initially to create users.
    - Create a seed script or temporary endpoint to bootstrap the first admin.

## Out of Scope
- "Forgot Password" via email (Admins manually reset passwords).
- "Manager" role logic (deferred).
- Complex password policies (min length is sufficient).
- Multi-factor authentication.
