---
name: project-security-audit
description: Security audit and vulnerability remediation for Next.js and Django projects. Checks for common vulnerabilities and applies fixes.
---

# Project Security Audit Skill

This skill provides a comprehensive workflow for auditing and fixing security vulnerabilities in web projects.

## When to Use

- User requests "verificar a segurança" (check security)
- User requests "conferir segurança" (verify security)
- User requests "remover vulnerabilidades" (remove vulnerabilities)
- User requests "tornar seguro" (make secure)
- Before deploying to production

## Prerequisites

- Access to project source code
- Understanding of project stack (Next.js, Django, etc.)
- Ability to run build commands

## Workflow

### 1. Initial Assessment

```bash
# Check project structure
ls -la
cat package.json  # or requirements.txt for Python

# Check for common security files
ls -la .env* 2>/dev/null
ls -la .gitignore
```

### 2. Dependency Audit

```bash
# For Node.js projects
npm audit
npm audit fix

# For Python projects
pip list | grep -iE "django|rest|jwt|pillow"
```

### 3. Code Security Review

#### Authentication & Session Security
- [ ] Session tokens use secure random generation (`crypto.randomUUID()`)
- [ ] Passwords hashed with bcrypt (not plain text)
- [ ] Session tokens stored in HTTP-only cookies
- [ ] Cookie `secure` flag set appropriately (false for localhost, true for production)
- [ ] Session expiration implemented

#### Input Validation
- [ ] All user inputs validated on server side
- [ ] Zod schemas used for validation (Next.js)
- [ ] SQL injection prevented (using Prisma ORM)
- [ ] XSS prevention (proper escaping)

#### Authorization
- [ ] Protected routes require authentication
- [ ] Users can only access their own resources
- [ ] API endpoints check ownership before modifications

#### Cookie Security
```javascript
// Check for secure cookie settings
const isSecure = headers().get('host') !== 'localhost'
cookie = {
  httpOnly: true,
  secure: isSecure, // false for localhost, true for production
  sameSite: 'lax',
  path: '/'
}
```

### 4. Vulnerability Fixes

#### Common Fixes

**1. Remove conflicting middleware**
```bash
# Next.js 16 uses proxy.ts, not middleware.ts
rm -f src/middleware.ts
```

**2. Fix cookie security**
```javascript
// In session.ts or similar
const isSecureConnection = () => {
  const host = headers().get('host') || ''
  return !host.includes('localhost')
}

// Use in cookie setting
secure: isSecureConnection()
```

**3. Add body size limits**
```javascript
// next.config.ts
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb'
    }
  }
}
```

**4. Remove exposed secrets**
```bash
# Check if .env is tracked
git ls-files .env

# Remove from git if tracked
git rm --cached .env
```

### 5. Build Verification

```bash
# Verify build passes after fixes
npx next build 2>&1 | tail -25

# For Django
python manage.py check
```

### 6. Testing

```bash
# Run existing tests
npm test

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## Security Checklist

### Authentication
- [ ] Password minimum 8 characters
- [ ] Email validation with regex
- [ ] bcrypt for password hashing
- [ ] Secure session tokens (UUID)
- [ ] Session expiration

### Authorization
- [ ] Protected routes in proxy.ts/middleware.ts
- [ ] Ownership checks on mutations
- [ ] Proper HTTP status codes (401, 403, 404)

### Data Protection
- [ ] No sensitive data in logs
- [ ] Database files in .gitignore
- [ ] Environment variables not committed

### Headers & Cookies
- [ ] HTTP-only cookies
- [ ] Secure flag (context-aware)
- [ ] SameSite policy

## Common Vulnerabilities & Fixes

### 1. Session Prediction
**Issue**: Using user ID in cookie
**Fix**: Use random UUID tokens stored in database

### 2. Insecure Cookie Settings
**Issue**: `secure: true` on localhost
**Fix**: Detect localhost via host header

### 3. Missing CORS Headers
**Issue**: API accessible from any origin
**Fix**: Configure CORS in next.config.ts or proxy.ts

### 4. Exposed Environment Variables
**Issue**: .env file committed to git
**Fix**: Add to .gitignore, remove from git history

### 5. Weak Password Policy
**Issue**: No minimum password length
**Fix**: Enforce minimum 8 characters

## Project-Specific Checks

### Next.js Projects
```bash
# Check for proxy.ts (Next.js 16)
ls -la src/proxy.ts

# Check for conflicting middleware.ts
ls -la src/middleware.ts

# Verify server actions configuration
grep -r "serverActions" next.config.ts
```

### Django Projects
```bash
# Check settings.py for DEBUG mode
grep "DEBUG" config/settings.py

# Check for SECRET_KEY exposure
grep "SECRET_KEY" config/settings.py

# Verify CORS settings
grep -i "cors" config/settings.py
```

## Reporting

After audit, provide summary:
1. **Vulnerabilities found**: List with severity
2. **Fixes applied**: What was changed
3. **Remaining issues**: Items needing manual attention
4. **Recommendations**: Best practices for future development

## Important Notes

1. **Test after fixes**: Always run build and tests after security changes
2. **Backup first**: Create a commit before major security changes
3. **User preference**: User prefers all fixes done at once ("corrija tudo")
4. **Communication**: Respond in Portuguese when user communicates in Portuguese