---
name: project-reading
description: Read and understand a Next.js project structure. Reads key files and provides project overview.
---

# Project Reading Skill

This skill provides a systematic approach to reading and understanding a Next.js project structure.

## When to Use

- User requests "ler este projeto" (read this project)
- User requests "entender o projeto" (understand the project)
- User requests "conferir o projeto" (check the project)
- Starting a new session with an unfamiliar project
- Before making changes to understand existing code

## Prerequisites

- Access to project directory
- Understanding of Next.js project structure

## Workflow

### 1. Directory Structure Overview

```bash
# List root directory
ls -la

# List src directory structure
find src -type f -name "*.tsx" -o -name "*.ts" | head -20

# Check for key directories
ls -la src/app/
ls -la src/modules/
ls -la src/lib/
ls -la prisma/
```

### 2. Configuration Files

Read these files in order:

```bash
# Package.json - dependencies and scripts
cat package.json

# TypeScript configuration
cat tsconfig.json

# Next.js configuration
cat next.config.ts

# Environment variables (check structure, not secrets)
cat .env 2>/dev/null | head -5

# Prisma schema
cat prisma/schema.prisma
```

### 3. Application Structure

```bash
# Main layout
cat src/app/layout.tsx

# Home page
cat src/app/page.tsx

# Check for middleware/proxy
ls -la src/middleware.ts 2>/dev/null
ls -la src/proxy.ts 2>/dev/null
```

### 4. Module Structure

For each module in `src/modules/`:

```bash
# List module files
ls -la src/modules/auth/
ls -la src/modules/users/
ls -la src/modules/posts/

# Read key files
cat src/modules/auth/auth.actions.ts
cat src/modules/auth/auth.schema.ts
cat src/modules/auth/auth.service.ts
```

### 5. Library Files

```bash
# Session management
cat src/lib/session.ts

# Database connection
cat src/shared/lib/prisma.ts

# Authentication
cat src/shared/lib/auth.ts
```

### 6. API Routes

```bash
# List API routes
find src/app/api -type f -name "route.ts" | head -10

# Read example route
cat src/app/api/auth/register/route.ts
```

## Project Overview Template

After reading, provide summary:

### 1. Tech Stack
- Framework: Next.js 16
- Database: SQLite with Prisma 7
- Authentication: Custom session + NextAuth
- Language: TypeScript

### 2. Project Structure
```
src/
├── app/              # Pages and routes
├── modules/          # Feature modules
├── lib/              # Utilities
├── shared/           # Shared code
└── types/            # Type definitions
```

### 3. Key Features
- Authentication (login, register, profile)
- CRUD operations
- File uploads
- Session management

### 4. Architecture Decisions
- Module-based organization
- Server actions for mutations
- Prisma for database
- Custom session system

## Common Patterns to Note

### File Naming
- `*.actions.ts` - Server actions
- `*.schema.ts` - Zod validation schemas
- `*.service.ts` - Business logic
- `*.tsx` - React components

### Authentication Flow
1. User submits form
2. Server action validates with Zod
3. Password hashed with bcrypt
4. Session token created (UUID)
5. Cookie set with httpOnly, secure flags

### Database Pattern
- Prisma schema in `prisma/schema.prisma`
- Generated client in `src/generated/`
- Database file: `prisma/dev.db`

## Important Notes

1. **Read in order**: Start with configuration, then structure, then code
2. **Note patterns**: Look for naming conventions and architecture patterns
3. **Check security**: Note authentication and authorization approach
4. **Document findings**: Provide clear summary for user

## Example Output

```markdown
## Project Overview: next_demo_base

### Tech Stack
- Next.js 16 with TypeScript
- Prisma 7 with SQLite
- Custom session system + NextAuth for Google
- Better-sqlite3 driver

### Structure
- `src/app/` - Pages and API routes
- `src/modules/` - Feature modules (auth, users, posts)
- `src/lib/` - Utilities (session management)
- `prisma/` - Database schema and files

### Key Features
1. Email/password authentication
2. Google OAuth login
3. User profile management
4. Post CRUD operations
5. File uploads (photos)

### Architecture
- Server actions for mutations
- Zod schemas for validation
- Custom session with UUID tokens
- Cookie-based authentication
```

## Troubleshooting

### Can't find project structure
```bash
# Check if in correct directory
pwd
ls -la

# Look for package.json
find . -name "package.json" -maxdepth 2
```

### Missing files
```bash
# Check if dependencies installed
ls node_modules/ | head -5

# Install if needed
npm install
```

### Database issues
```bash
# Check if database exists
ls -la prisma/

# Regenerate if needed
npx prisma generate
```