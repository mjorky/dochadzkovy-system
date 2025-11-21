# Tasks: Authentication & Security

## 1. Backend: Database & Auth Infrastructure
- [x] **Update Prisma Schema** `backend/prisma/schema.prisma` <!-- id: 0 -->
    - Add `UserCredentials` model with one-to-one relation to `Zamestnanci`.
    - Run migration `npx prisma migrate dev --name add_user_credentials`.
- [x] **Install Auth Dependencies** <!-- id: 1 -->
    - Run `npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt` (and types) in `backend/`.
- [x] **Generate Auth Module** <!-- id: 2 -->
    - Create `AuthModule`, `AuthService`, `AuthController` (or Resolver).
    - Create `JwtStrategy` and `LocalStrategy` (if needed, or custom).
- [x] **Implement Login Mutation** <!-- id: 3 -->
    - Create `login` mutation in `AuthResolver`.
    - Logic: Validate username/password (bcrypt compare), return JWT access token.
    - Payload: `{ sub: userId, username: string, isAdmin: boolean }`.
- [x] **Implement Auth Guards** <!-- id: 4 -->
    - Create `GqlAuthGuard` (extends `AuthGuard('jwt')`).
    - Create `@CurrentUser()` decorator to extract user from context.
    - Apply Guard to all existing Resolvers (except `login` and `health`).

## 2. Backend: Username Generation & Employee Management
- [x] **Create Username Utility** <!-- id: 5 -->
    - Implement `generateUsername(firstName, lastName)` helper.
    - Logic: Normalize strings, strip diacritics, handle collisions (check DB).
- [x] **Update Employee Mutations** <!-- id: 6 -->
    - Update `createEmployee`: Automatically generate username and default password (or require password input). Create `UserCredentials` entry.
    - Update `updateEmployee`: If name changes, regenerate username? (Maybe simpler to KEEP existing username unless explicitly requested to change - check requirements. *Spec implies auto-generation, let's assume on CREATE only for now to avoid breaking logins, or ask user. Decision: Generate on CREATE. Update logic if name changes is complex, stick to CREATE for MVP unless specified.*).
    - *Correction based on Spec:* Spec says "Trigger: Occurs when an Admin creates a new employee or updates an employee's name". So we MUST handle rename.
    - Update `updateEmployee`: If name changes, check if `UserCredentials` exists. If so, update username. Handle collisions.
- [x] **Add Password Reset Mutation** <!-- id: 7 -->
    - Create `resetPassword(employeeId, newPassword)` mutation (Admin only).
    - Hash new password and update `UserCredentials`.
- [x] **Create Initial Admin Seeder** <!-- id: 8 -->
    - Create a script `backend/src/scripts/seed-admin.ts`.
    - Checks if any admin exists. If not, creates one with known credentials (e.g., `admin`/`password`).

## 3. Frontend: Login & Auth State
- [x] **Create Login Page** `frontend/src/app/login/page.tsx` <!-- id: 9 -->
    - Use Shadcn Card, Form, Input, Button.
    - Fields: Username, Password.
    - onSubmit: Call `login` mutation.
    - On success: Save token to `localStorage`, redirect to `/`.
- [x] **Implement Auth Provider** <!-- id: 10 -->
    - Create `AuthProvider` (React Context).
    - State: `user` (from token decode), `isAuthenticated`, `login`, `logout`.
    - Check token on mount. If expired/missing, redirect to `/login`.
- [x] **Update Apollo Client** `frontend/src/lib/apollo-client.ts` <!-- id: 11 -->
    - Add `setContext` link to inject `Authorization` header from `localStorage`.
- [x] **Secure Routes & Layout** <!-- id: 12 -->
    - Wrap main layout (or specific sub-layouts) with `AuthGuard` component.
    - Redirect unauthenticated users to `/login`.

## 4. Frontend: Access Control (RBAC)
- [x] **Admin Menu Visibility** <!-- id: 13 -->
    - Update `Sidebar` or `Navigation` component.
    - Hide "Admin" section if `!user.isAdmin`.
- [x] **Route Protection** <!-- id: 14 -->
    - In `admin/*` pages, add check: if `!user.isAdmin`, redirect to `/` or show "Access Denied".

## 5. Testing & Polish
- [x] **Test Login Flow** <!-- id: 15 -->
    - Verify login with valid/invalid credentials.
    - Verify token storage and persistence.
- [x] **Test Admin Features** <!-- id: 16 -->
    - Create new employee -> Check if username generated correctly.
    - Rename employee -> Check if username updates.
    - Reset password -> Verify new password works.
- [x] **Test Access Control** <!-- id: 17 -->
    - Log in as Regular user -> Verify Admin menu hidden, Admin routes inaccessible.
    - Log in as Admin -> Verify full access.
