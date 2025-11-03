# Production Readiness Checklist

This document tracks configuration items and code changes that must be updated before deploying to production.

## Security & Configuration

### CORS Configuration
**Location**: `backend/src/main.ts`

**Current (Development)**:
```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',      // Next.js dev server
    'http://127.0.0.1:3000',      // Next.js (IP)
    'http://localhost:5173',      // Vite dev server (if used)
    'http://127.0.0.1:5173',      // Vite (IP)
  ],
  credentials: true,
});
```

**Required for Production**:
- [ ] Replace localhost origins with actual production domain(s)
- [ ] Example: `origin: ['https://dochadzka.yourdomain.com', 'https://app.yourdomain.com']`
- [ ] Consider environment variable: `ALLOWED_ORIGINS=https://domain1.com,https://domain2.com`
- [ ] Remove any localhost/127.0.0.1 entries

---

## Environment Variables

### Database Connection
**Current (Development)**:
- Database: `postgres://dochadzka:dochadzka@localhost:5433/dochadzka`
- Credentials hardcoded in Docker compose

**Required for Production**:
- [ ] Use strong, randomly generated passwords
- [ ] Store credentials in secure secret management (AWS Secrets Manager, Azure Key Vault, etc.)
- [ ] Use environment variables, never commit credentials to git
- [ ] Enable SSL/TLS for database connections (`?sslmode=require`)

---

## API & Endpoints

### GraphQL Playground
**Current (Development)**:
- GraphQL Playground enabled for development/debugging

**Required for Production**:
- [ ] Disable GraphQL Playground in production
- [ ] Set `playground: false` in GraphQL module config
- [ ] Consider introspection: `introspection: false` for production (optional, based on security policy)

---

## Monitoring & Logging

**Required for Production**:
- [ ] Set up structured logging (JSON format)
- [ ] Configure log levels (error, warn, info only - no debug)
- [ ] Set up error tracking (Sentry, Rollbar, or similar)
- [ ] Monitor `/health` endpoint for uptime checks
- [ ] Set up performance monitoring (APM)

---

## Build & Deployment

**Required for Production**:
- [ ] Use production builds: `npm run build` (not dev mode)
- [ ] Enable minification and optimization
- [ ] Remove development dependencies from production containers
- [ ] Set `NODE_ENV=production`
- [ ] Configure CDN for frontend static assets
- [ ] Enable gzip/brotli compression

---

## Authentication & Authorization

**Required for Production** (Phase 2+):
- [ ] Enable JWT authentication
- [ ] Use HTTPS only (no HTTP)
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Configure secure session management

---

## Database

**Required for Production**:
- [ ] Set up connection pooling (adjust pool size for production load)
- [ ] Enable query timeout limits
- [ ] Set up automated backups
- [ ] Configure read replicas if needed
- [ ] Run database migrations in controlled manner
- [ ] Monitor query performance

---

## Notes

- Review this checklist before each production deployment
- Update this document as new configuration items are identified
- Some items may be addressed in later development phases
