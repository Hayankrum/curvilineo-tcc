import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { obterSessao } from '@/lib/session'

const execAsync = promisify(exec)

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  duration: number
  error?: string
}

interface TestFile {
  file: string
  tests: TestResult[]
  passed: number
  failed: number
  skipped: number
  duration: number
}

interface CoverageData {
  statements: { total: number; covered: number; percentage: number }
  branches: { total: number; covered: number; percentage: number }
  functions: { total: number; covered: number; percentage: number }
  lines: { total: number; covered: number; percentage: number }
}

interface TestRunResult {
  success: boolean
  totalTests: number
  totalPassed: number
  totalFailed: number
  totalSkipped: number
  duration: number
  files: TestFile[]
  coverage: CoverageData | null
  error?: string
  timestamp: string
}

async function readCoverageReport(): Promise<CoverageData | null> {
  try {
    const coveragePath = join(process.cwd(), 'coverage', 'coverage-summary.json')
    const data = await readFile(coveragePath, 'utf-8')
    const summary = JSON.parse(data)

    return {
      statements: {
        total: summary.total.statements.total,
        covered: summary.total.statements.covered,
        percentage: summary.total.statements.pct,
      },
      branches: {
        total: summary.total.branches.total,
        covered: summary.total.branches.covered,
        percentage: summary.total.branches.pct,
      },
      functions: {
        total: summary.total.functions.total,
        covered: summary.total.functions.covered,
        percentage: summary.total.functions.pct,
      },
      lines: {
        total: summary.total.lines.total,
        covered: summary.total.lines.covered,
        percentage: summary.total.lines.pct,
      },
    }
  } catch {
    return null
  }
}

function parseVitestOutput(output: string): TestFile[] {
  const files: TestFile[] = []
  const lines = output.split('\n')

  let currentFile: TestFile | null = null

  for (const line of lines) {
    const fileMatch = line.match(/^(✓|×|提速|↓)\s+(.+?)\s+\((\d+(?:\.\d+)?)\s*ms\)/)
    if (fileMatch) {
      if (currentFile) files.push(currentFile)
      const test: TestResult = {
        name: fileMatch[2].trim(),
        status: fileMatch[1] === '✓' ? 'pass' : fileMatch[1] === '×' ? 'fail' : 'skip',
        duration: parseFloat(fileMatch[3]),
      }
      currentFile = {
        file: '',
        tests: [test],
        passed: test.status === 'pass' ? 1 : 0,
        failed: test.status === 'fail' ? 1 : 0,
        skipped: test.status === 'skip' ? 1 : 0,
        duration: test.duration,
      }
      continue
    }

    const simpleTestMatch = line.match(/^\s+(✓|×|↓)\s+(.+?)(?:\s+\((\d+(?:\.\d+)?)\s*ms\))?$/)
    if (simpleTestMatch && currentFile) {
      const test: TestResult = {
        name: simpleTestMatch[2].trim(),
        status: simpleTestMatch[1] === '✓' ? 'pass' : simpleTestMatch[1] === '×' ? 'fail' : 'skip',
        duration: simpleTestMatch[3] ? parseFloat(simpleTestMatch[3]) : 0,
      }
      currentFile.tests.push(test)
      currentFile.passed += test.status === 'pass' ? 1 : 0
      currentFile.failed += test.status === 'fail' ? 1 : 0
      currentFile.skipped += test.status === 'skip' ? 1 : 0
      currentFile.duration += test.duration
    }
  }

  if (currentFile) files.push(currentFile)
  return files
}

export async function POST(request: Request) {
  const usuario = await obterSessao()
  if (!usuario) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Testes só podem ser executados em desenvolvimento' },
      { status: 403 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const withCoverage = body.coverage === true

  const startTime = Date.now()

  try {
    const command = withCoverage
      ? 'npx vitest run --coverage --reporter=verbose 2>&1'
      : 'npx vitest run --reporter=verbose 2>&1'

    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      timeout: 120000,
      env: { ...process.env, FORCE_COLOR: '0' },
    })

    const output = stdout + stderr
    const duration = Date.now() - startTime

    const files = parseVitestOutput(output)

    const totalTests = files.reduce((acc, f) => acc + f.tests.length, 0)
    const totalPassed = files.reduce((acc, f) => acc + f.passed, 0)
    const totalFailed = files.reduce((acc, f) => acc + f.failed, 0)
    const totalSkipped = files.reduce((acc, f) => acc + f.skipped, 0)

    const coverage = withCoverage ? await readCoverageReport() : null

    const result: TestRunResult = {
      success: totalFailed === 0,
      totalTests,
      totalPassed,
      totalFailed,
      totalSkipped,
      duration,
      files,
      coverage,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    const duration = Date.now() - startTime
    const err = error as { stdout?: string; stderr?: string; message?: string }
    const output = (err.stdout || '') + (err.stderr || '')
    const files = parseVitestOutput(output)

    return NextResponse.json({
      success: false,
      totalTests: files.reduce((acc, f) => acc + f.tests.length, 0),
      totalPassed: files.reduce((acc, f) => acc + f.passed, 0),
      totalFailed: files.reduce((acc, f) => acc + f.failed, 0),
      totalSkipped: files.reduce((acc, f) => acc + f.skipped, 0),
      duration,
      files,
      coverage: null,
      error: err.message || 'Erro ao executar testes',
      timestamp: new Date().toISOString(),
    } satisfies TestRunResult)
  }
}

export async function GET() {
  const coverage = await readCoverageReport()
  return NextResponse.json({ coverage })
}
