# Authentication Migration Guide

This guide describes the steps required to update your local development environment and database to support the new Authentication & Security features (Phase 11).

## 1. Pull Latest Changes

Ensure you have the latest code from the repository.

```bash
git pull origin authentication-security
```

## 2. Install New Dependencies

New packages have been added to both backend and frontend.

**Backend:**
- `@nestjs/jwt`
- `@nestjs/passport`
- `passport`
- `passport-jwt`
- `bcrypt`
- `@types/bcrypt`
- `@types/passport-jwt`

**Frontend:**
- `jwt-decode`
- `@apollo/client` (Import paths updated for v3+)

Run the installation commands:

```bash
# In the root directory
npm install

# Or if you want to be specific:
cd backend && npm install
cd ../frontend && npm install
```

## 3. Update Database Schema

A new table `UserCredentials` has been added to the Prisma schema to store login information securely.

Run the Prisma migration to update your local database structure:

```bash
cd backend
npx prisma migrate dev --name add_user_credentials
```

*Note: If you encounter drift issues, you might need to reset your local database, but try `migrate dev` first.*

## 4. Backfill User Credentials

Existing employees in your local database will not have login credentials by default. We have created a script to generate them automatically.

The script will:
1.  Find all employees without credentials.
2.  Generate a username in the format `firstname.lastname` (normalized).
3.  Set the default password to `EmsT_2811`.

Run the backfill script:

```bash
# From the backend directory
npx ts-node src/scripts/backfill-credentials.ts
```

## 5. Verify Setup

1.  **Start the application:**
    ```bash
    # Root directory
    npm run dev
    ```

2.  **Access the Login Page:**
    Open `http://localhost:3000`. You should be redirected to `/login`.

3.  **Log In:**
    - **Username:** Try logging in as `admin.user` (if seeded) or any employee using `firstname.lastname` (e.g., `milan.smotlak`).
    - **Password:** 
        - For `admin.user`: `admin123` (if created by seed script)
        - For regular employees: `EmsT_2811`

4.  **Test Logout:**
    Click the "Logout" button in the sidebar to verify you are redirected back to login.

## Troubleshooting

**Issue: "User has no credentials" error when resetting password**
- **Solution:** Run the backfill script (Step 4) again to ensure the user has a `UserCredentials` entry.

**Issue: `Module not found: Can't resolve ...`**
- **Solution:** Ensure you ran `npm install` in both `frontend` and `backend` directories.

**Issue: `Drift detected` during migration**
- **Solution:** If this is your local development DB and you don't mind losing data, run `npx prisma migrate reset`. Otherwise, you may need to manually align your schema.

