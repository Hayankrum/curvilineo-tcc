---
name: nextjs-build-verification
description: Build verification and quality checks for Next.js projects. Runs build, lint, type checks, and tests.
---

# Next.js Build Verification Skill

This skill provides a complete workflow for verifying Next.js project builds and code quality.

## When to Use

- User requests "verificar o projeto" (check the project)
- User requests "conferir se está funcionando" (check if it's working)
- After making code changes
- Before committing or deploying
- When troubleshooting build errors

## Prerequisites

- Node.js project with `package.json`
- Next.js configured correctly
- Access to project directory

## Workflow

### 1. Clean Build Environment

```bash
# Kill any existing dev server
kill $(lsof -ti:3000) 2>/dev/null

# Clean build artifacts (optional but recommended)
rm -rf .next
rm -rf node_modules/.cache
```

### 2. Install Dependencies

```bash
# Install dependencies
npm install

# If using Prisma, generate client
npx prisma generate
```

### 3. Run Build

```bash
# Build the project
npx next build 2>&1 | tail -25

# Check for errors
if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
  exit 1
fi
```

### 4. Code Quality Checks

#### Linting
```bash
# Run ESLint
npm run lint 2>&1

# Fix auto-fixable issues
npm run lint -- --fix
```

#### Type Checking
```bash
# Run TypeScript type check
npx tsc --noEmit 2>&1

# Check for type errors
if [ $? -eq 0 ]; then
  echo "✅ No type errors"
else
  echo "❌ Type errors found"
fi
```

#### Testing
```bash
# Run unit tests
npm test 2>&1

# Run tests in watch mode (for development)
npm run test:watch
```

### 5. Database Verification (if using Prisma)

```bash
# Reset database (if needed)
rm -f prisma/dev.db
npx prisma db push

# Verify schema
npx prisma studio
```

### 6. Start Development Server

```bash
# Start dev server
npm run dev &>/tmp/nextdev.log &
sleep 4

# Verify server is running
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

## Common Build Errors & Fixes

### 1. TypeScript Errors
```bash
# Check specific file
npx tsc --noEmit src/path/to/file.ts

# Common fix: Update tsconfig.json
cat tsconfig.json
```

### 2. ESLint Errors
```bash
# See all errors
npm run lint 2>&1

# Fix auto-fixable
npm run lint -- --fix
```

### 3. Missing Dependencies
```bash
# Check for missing packages
npm ls 2>&1 | grep -i "missing\|undefined"

# Install missing
npm install package-name
```

### 4. Prisma Errors
```bash
# Regenerate client
npx prisma generate

# Push schema changes
npx prisma db push
```

### 5. Build Memory Issues
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npx next build
```

## Quality Checklist

### Build
- [ ] `npx next build` succeeds
- [ ] No TypeScript errors
- [ ] No ESLint errors (or only warnings)
- [ ] All tests pass

### Code Quality
- [ ] Consistent code style
- [ ] No console.log in production code
- [ ] Proper error handling
- [ ] Type safety (no `any` types)

### Performance
- [ ] No unnecessary re-renders
- [ ] Proper use of React Server Components
- [ ] Image optimization
- [ ] Code splitting

## Automation Script

Create a verification script:

```bash
#!/bin/bash
# verify.sh - Run all verification checks

set -e

echo "🔍 Running verification checks..."

# 1. Clean
echo "1. Cleaning build artifacts..."
rm -rf .next

# 2. Install
echo "2. Installing dependencies..."
npm install

# 3. Build
echo "3. Building project..."
npx next build

# 4. Lint
echo "4. Running linter..."
npm run lint

# 5. Type check
echo "5. Running type check..."
npx tsc --noEmit

# 6. Tests
echo "6. Running tests..."
npm test

echo "✅ All checks passed!"
```

Make it executable:
```bash
chmod +x verify.sh
./verify.sh
```

## Troubleshooting

### Build hangs
```bash
# Kill stuck processes
pkill -f "next build"

# Clear cache
rm -rf .next
rm -rf node_modules/.cache

# Try again
npx next build
```

### Port already in use
```bash
# Find process on port 3000
lsof -ti:3000

# Kill it
kill $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
```

### Prisma database locked
```bash
# Remove database file
rm -f prisma/dev.db
rm -f prisma/dev.db-journal

# Regenerate
npx prisma generate
npx prisma db push
```

## Important Notes

1. **Always build before committing**: Ensure code compiles
2. **Run tests after changes**: Verify functionality
3. **Check for warnings**: Address ESLint warnings
4. **Database changes**: Regenerate Prisma client after schema changes
5. **Clean build**: Remove `.next` directory if build seems stale