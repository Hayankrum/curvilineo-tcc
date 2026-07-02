---
name: playwright-e2e-testing
description: End-to-end testing with Playwright for Next.js projects. Installs Playwright, runs tests, and cleans up.
---

# Playwright E2E Testing Skill

This skill provides a complete workflow for running end-to-end tests with Playwright in Next.js projects.

## When to Use

- User requests "testar todas as funcionalidades" (test all functionalities)
- User requests "teste completo" (complete test)
- User requests "verificar se está funcionando" (verify if it's working)
- Security audit requires e2e testing
- After implementing new features that need validation

## Prerequisites

- Node.js project with `package.json`
- Next.js development server capable of running on port 3000
- No existing process on port 3000

## Workflow

### 1. Check and Install Playwright

```bash
# Check if Playwright is installed
npx playwright --version 2>&1 || echo "não instalado"

# Install Playwright as dev dependency
npm install --save-dev playwright 2>&1 | tail -3

# Install Chromium browser
npx playwright install chromium 2>&1 | tail -5
```

### 2. Start Development Server

```bash
# Kill any existing process on port 3000
kill $(lsof -ti:3000) 2>/dev/null

# Start dev server in background
cd "/path/to/project" && nohup npm run dev &>/tmp/nextdev.log &
echo "PID: $!"
sleep 4

# Verify server is running
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

### 3. Run E2E Tests

Create a test file (e.g., `test-e2e.mjs`) with the following structure:

```javascript
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext()
const page = await ctx.newPage()

// Test results tracking
const results = []
function log(test, ok, detail) {
  results.push({ test, ok })
  console.log(ok ? '  ✓' : '  ✗', test + (detail ? ' — ' + detail : ''))
}

try {
  // Test 1: Home page loads
  log('Home page', true)
  
  // Test 2: Registration flow
  await page.goto('http://localhost:3000/usuarios/registro', { waitUntil: 'networkidle' })
  await page.fill('input[name="nome"]', 'Test User')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="senha"]', 'senha1234')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(3000)
  
  // Test 3: Login flow
  // Test 4: Protected routes
  // Test 5: CRUD operations
  
} catch (error) {
  log('Test error', false, error.message)
} finally {
  await browser.close()
  
  // Print summary
  const passed = results.filter(r => r.ok).length
  const failed = results.filter(r => !r.ok).length
  console.log(`\nResults: ${passed} passed, ${failed} failed`)
}
```

Run the tests:
```bash
cd "/path/to/project" && node test-e2e.mjs
```

### 4. Cleanup

```bash
# Kill dev server
kill $(lsof -ti:3000) 2>/dev/null

# Optionally uninstall Playwright (if not needed permanently)
npm uninstall playwright 2>&1 | tail -1
```

## Common Test Scenarios

### Authentication Testing
```javascript
// Registration
await page.goto('http://localhost:3000/usuarios/registro')
await page.fill('input[name="nome"]', 'Test User')
await page.fill('input[name="email"]', 'test@example.com')
await page.fill('input[name="senha"]', 'senha1234')
await page.click('button[type="submit"]')

// Login
await page.goto('http://localhost:3000/usuarios/login')
await page.fill('input[name="email"]', 'test@example.com')
await page.fill('input[name="senha"]', 'senha1234')
await page.click('button[type="submit"]')
```

### Protected Route Testing
```javascript
// Test redirect when not authenticated
await page.goto('http://localhost:3000/posts/novo')
const url = page.url()
console.log('Redirected to:', url.includes('/usuarios/login') ? 'Login page ✓' : 'No redirect ✗')
```

### Form Validation Testing
```javascript
// Test short password rejection
await page.goto('http://localhost:3000/usuarios/registro')
await page.fill('input[name="senha"]', 'short')
await page.click('button[type="submit"]')
// Check for error message
```

## Important Notes

1. **Cookie Handling**: Playwright headless Chromium may not send cookies on non-navigation POSTs due to `SameSite: Lax` policy
2. **Server Actions**: Next.js server actions require the React `Next-Action` protocol - plain curl won't work
3. **Port Management**: Always kill existing processes on port 3000 before starting
4. **Cleanup**: Remember to uninstall Playwright if it's only needed temporarily

## Troubleshooting

### Playwright not installed
```bash
npm install --save-dev playwright
npx playwright install chromium
```

### Server won't start
```bash
# Check if port is in use
lsof -ti:3000

# Kill process
kill $(lsof -ti:3000) 2>/dev/null

# Check server logs
cat /tmp/nextdev.log
```

### Tests fail with cookie errors
- This is a known issue with headless Chromium and `SameSite: Lax` cookies
- Consider using hidden form fields or explicit cookie injection for server actions