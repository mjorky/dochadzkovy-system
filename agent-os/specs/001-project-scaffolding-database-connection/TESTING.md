# Testing Guide - Attendance System

This guide will help you set up and test the Attendance System application on your local computer. No advanced technical knowledge is required - just follow the steps carefully.

## Prerequisites

Before you begin, make sure you have:

1. **PostgreSQL Database** running at `localhost:5433`
   - Database name: `dochadzka`
   - Username: `dochadzka`
   - Password: `dochadzka`
   - If the database is not running, the health check will show an error.

2. **Node.js** version 20 or higher installed
   - Check by running: `node --version` in your terminal
   - If not installed, download from: https://nodejs.org/

3. **pnpm** package manager installed
   - Check by running: `pnpm --version` in your terminal
   - If not installed, run: `npm install -g pnpm`

## Step-by-Step Setup

### Step 1: Install Dependencies

Open your terminal and navigate to the project folder, then run:

```bash
pnpm install
```

This will install all required packages for both the backend and frontend. It may take a few minutes.

### Step 2: Configure Environment Variables

The application needs configuration files to know where to find the database and API.

**For Backend:**
```bash
cd backend
cp .env.example .env
```

The default values should work for local development. If your database is configured differently, edit the `backend/.env` file.

**For Frontend:**
```bash
cd ../frontend
cp .env.example .env.local
```

The default values should work for local development.

### Step 3: Generate Database Schema

From the backend directory, run:

```bash
cd backend
pnpm prisma:generate
```

This creates the database client code needed to connect to your PostgreSQL database.

## Running the Application

You have two options for running the application:

### Option A: Run Both Servers Concurrently (Recommended)

From the project root directory, run:

```bash
pnpm dev:all
```

This will start both the backend and frontend servers simultaneously. You'll see output from both servers in the same terminal window.

### Option B: Run Servers Separately

This is useful if you want to see each server's output in separate terminal windows.

**Terminal 1 - Backend:**
```bash
cd backend
pnpm dev
```

Wait until you see:
```
Application is running on: http://localhost:4000
GraphQL Playground: http://localhost:4000/graphql
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm dev
```

Wait until you see:
```
✓ Ready in [X]ms
○ Local:   http://localhost:3000
```

## Testing the Application

### 1. Test Backend Health Check (REST)

Open your web browser and visit:
```
http://localhost:4000/health
```

**Expected Result:**
You should see a JSON response like:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-11-03T20:00:00.000Z"
}
```

### 2. Test GraphQL Playground

Open your web browser and visit:
```
http://localhost:4000/graphql
```

**Expected Result:**
You should see the GraphQL Playground interface. Try running this query:

```graphql
query {
  health {
    status
    database
  }
}
```

Click the "Play" button. You should see:
```json
{
  "data": {
    "health": {
      "status": "ok",
      "database": "connected"
    }
  }
}
```

### 3. Test Frontend Application

Open your web browser and visit:
```
http://localhost:3000
```

**Expected Result:**
You should see:
- Page title: "Attendance System - Dochádzkový Systém"
- A health check card with a green checkmark (Tangerine orange color)
- Status showing "System Connected"
- Database status showing "connected" in orange

The page should have a clean design with the Tangerine theme colors (orange primary color).

## What Success Looks Like

When everything is working correctly:

1. ✅ Backend runs on port 4000 without errors
2. ✅ Frontend runs on port 3000 without errors
3. ✅ Health check REST endpoint returns JSON with "ok" status
4. ✅ GraphQL Playground shows successful health query
5. ✅ Frontend landing page shows green/orange checkmark
6. ✅ No error messages in the terminal
7. ✅ Browser console has no errors (press F12 to check)

## Troubleshooting

### Problem: "Port 4000 is already in use"

**Solution:**
Another application is using port 4000. Either:
- Stop the other application using that port
- Or change the port in `backend/.env`:
  ```
  PORT=4001
  ```
  Then update `frontend/.env.local`:
  ```
  NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4001/graphql
  ```

### Problem: "Port 3000 is already in use"

**Solution:**
Another application is using port 3000. The Next.js server will automatically suggest an alternative port (like 3001). If prompted, type `y` to use the suggested port.

### Problem: Database connection error

**Symptoms:**
- REST health check returns: `{"status": "error", "database": "disconnected"}`
- Frontend shows red X icon with "Connection Failed"

**Solutions:**
1. Verify PostgreSQL is running:
   ```bash
   # On macOS/Linux
   pg_isready -h localhost -p 5433
   ```

2. Check database credentials in `backend/.env`:
   ```
   DATABASE_URL=postgres://dochadzka:dochadzka@localhost:5433/dochadzka
   ```

3. Test database connection manually:
   ```bash
   cd backend
   pnpm prisma:studio
   ```
   If Prisma Studio opens, the database connection works.

### Problem: "Module not found" errors

**Solution:**
Dependencies may not be installed correctly. Run:
```bash
pnpm install
cd backend && pnpm install
cd ../frontend && pnpm install
```

### Problem: Frontend shows white/blank page

**Solutions:**
1. Check browser console for errors (press F12)
2. Make sure backend is running first
3. Clear browser cache and reload (Ctrl+Shift+R or Cmd+Shift+R)
4. Check that `.env.local` file exists in `frontend/` directory

### Problem: CORS errors in browser console

**Symptoms:**
Browser console shows: "Access to fetch at 'http://localhost:4000/graphql' from origin 'http://localhost:3000' has been blocked by CORS policy"

**Solution:**
Check `backend/.env` includes correct CORS origins:
```
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
```

Restart the backend server after making changes.

### Problem: Frontend shows loading spinner forever

**Symptoms:**
- Health check component shows "Checking connection..." indefinitely
- No error messages

**Solutions:**
1. Verify backend is running at http://localhost:4000
2. Check browser console for network errors (F12 → Console tab)
3. Verify `NEXT_PUBLIC_GRAPHQL_ENDPOINT` in `frontend/.env.local`
4. Try visiting http://localhost:4000/health directly to verify backend works

## Stopping the Application

### If using `pnpm dev:all`:
Press `Ctrl+C` in the terminal. This will stop both servers.

### If running servers separately:
Press `Ctrl+C` in each terminal window where servers are running.

## Additional Resources

- **Backend GraphQL Playground:** http://localhost:4000/graphql
- **Prisma Studio (Database viewer):** Run `cd backend && pnpm prisma:studio`
- **Project Documentation:** See `/docs` directory for technical details

## Getting Help

If you encounter issues not covered in this guide:

1. Check that all prerequisites are installed correctly
2. Verify the database is running and accessible
3. Look for error messages in the terminal or browser console
4. Make sure you followed all steps in order
5. Try restarting both servers

For technical support, provide:
- Error messages from terminal
- Error messages from browser console (F12 → Console)
- Steps you followed before the error occurred
- Your Node.js version (`node --version`)
- Your pnpm version (`pnpm --version`)
