'use client'

import { useState, useCallback } from 'react'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'pass' | 'fail' | 'skip'
  duration?: number
  error?: string
}

interface TestGroup {
  name: string
  icon: string
  tests: TestResult[]
}

export default function TestesPage() {
  const [groups, setGroups] = useState<TestGroup[]>([])
  const [running, setRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runAllTests = useCallback(async () => {
    setRunning(true)
    setCurrentTest(null)
    setError(null)

    // Carrega a estrutura dos testes
    let testGroups: TestGroup[]
    try {
      const res = await fetch('/api/testes/functional')
      if (res.status === 401) {
        setError('Voce precisa estar logado para executar os testes.')
        setRunning(false)
        return
      }
      const data = await res.json()
      testGroups = data.groups.map((g: TestGroup) => ({
        ...g,
        tests: g.tests.map((t: TestResult) => ({ ...t, status: 'pending' as const })),
      }))
    } catch {
      setRunning(false)
      return
    }

    setGroups(testGroups)

    // Executa cada teste um por um com animacao
    for (let gi = 0; gi < testGroups.length; gi++) {
      for (let ti = 0; ti < testGroups[gi].tests.length; ti++) {
        const testName = testGroups[gi].tests[ti].name
        setCurrentTest(testName)

        // Marca como rodando
        setGroups(prev => prev.map((g, gi2) => {
          if (gi2 !== gi) return g
          return {
            ...g,
            tests: g.tests.map((t, ti2) => {
              if (ti2 !== ti) return t
              return { ...t, status: 'running' }
            }),
          }
        }))

        // Espera um pouco pra animacao
        await new Promise(r => setTimeout(r, 150))
      }
    }

    // Agora roda os testes reais
    try {
      const res = await fetch('/api/testes/functional')
      if (res.status === 401) {
        setError('Sessao expirada. Faca login novamente.')
        setRunning(false)
        return
      }
      const data = await res.json()
      const realGroups: TestGroup[] = data.groups

      setGroups(prev => prev.map((g) => {
        const realGroup = realGroups.find((rg: TestGroup) => rg.name === g.name)
        if (!realGroup) return g
        return {
          ...g,
          tests: g.tests.map((t) => {
            const realTest = realGroup.tests.find((rt: TestResult) => rt.name === t.name)
            if (!realTest) return t
            return {
              ...t,
              status: realTest.status,
              duration: realTest.duration,
              error: realTest.error,
            }
          }),
        }
      }))
    } catch {
      // Mantem os testes como pending se falhar
    }

    setCurrentTest(null)
    setRunning(false)
  }, [])

  const totalTests = groups.reduce((acc, g) => acc + g.tests.length, 0)
  const passedTests = groups.reduce((acc, g) => acc + g.tests.filter(t => t.status === 'pass').length, 0)
  const failedTests = groups.reduce((acc, g) => acc + g.tests.filter(t => t.status === 'fail').length, 0)
  const totalDuration = groups.reduce((acc, g) => acc + g.tests.reduce((a, t) => a + (t.duration || 0), 0), 0)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Testes do Projeto
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Teste todas as funcionalidades do app
          </p>
        </div>
        <button
          onClick={runAllTests}
          disabled={running}
          className="px-6 py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
          style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
        >
          {running ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 rounded-full" style={{ borderColor: 'var(--btn-primary-text)', borderTopColor: 'transparent' }} />
              Testando...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Testar Tudo
            </>
          )}
        </button>
      </div>

      {groups.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalTests}</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Total</div>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0' }}>
            <div className="text-2xl font-bold text-green-600">{passedTests}</div>
            <div className="text-xs text-green-600">Passando</div>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: failedTests > 0 ? '#fee2e2' : 'var(--card-bg)', border: `1px solid ${failedTests > 0 ? '#fecaca' : 'var(--card-border)'}` }}>
            <div className={`text-2xl font-bold ${failedTests > 0 ? 'text-red-600' : ''}`} style={failedTests === 0 ? { color: 'var(--text-primary)' } : {}}>{failedTests}</div>
            <div className={`text-xs ${failedTests > 0 ? 'text-red-600' : ''}`} style={failedTests === 0 ? { color: 'var(--text-tertiary)' } : {}}>Falhando</div>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalDuration}ms</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Duracao</div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg p-4 mb-4 flex items-center gap-3" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span className="text-sm font-medium text-amber-800">{error}</span>
        </div>
      )}

      {currentTest && (
        <div className="rounded-lg p-3 mb-4 flex items-center gap-3" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <div className="animate-spin w-4 h-4 border-2 rounded-full" style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }} />
          <span className="text-sm text-blue-700">{currentTest}</span>
        </div>
      )}

      <div className="space-y-4">
        {groups.map((group, gi) => {
          const groupPassed = group.tests.filter(t => t.status === 'pass').length
          const groupFailed = group.tests.filter(t => t.status === 'fail').length
          const groupTotal = group.tests.length
          const groupDone = groupPassed + groupFailed

          return (
            <div key={gi} className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--card-border)' }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{group.icon}</span>
                  <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{group.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {groupFailed > 0 && <span className="text-xs font-medium text-red-500">{groupFailed} falha</span>}
                  {groupPassed > 0 && <span className="text-xs font-medium text-green-500">{groupPassed} passou</span>}
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{groupDone}/{groupTotal}</span>
                </div>
              </div>

              <div>
                {group.tests.map((test, ti) => (
                  <div
                    key={ti}
                    className="flex items-center gap-3 px-4 py-2.5"
                    style={{
                      borderTop: '1px solid var(--border-color)',
                      backgroundColor: test.status === 'running' ? '#eff6ff' : 'transparent',
                    }}
                  >
                    <div className="flex-shrink-0">
                      {test.status === 'pending' && (
                        <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: 'var(--border-color)' }} />
                      )}
                      {test.status === 'running' && (
                        <div className="animate-spin w-5 h-5 border-2 rounded-full" style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }} />
                      )}
                      {test.status === 'pass' && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                      {test.status === 'fail' && (
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </div>
                      )}
                      {test.status === 'skip' && (
                        <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">-</span>
                        </div>
                      )}
                    </div>

                    <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                      {test.name}
                    </span>

                    {test.duration !== undefined && test.duration > 0 && (
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {test.duration}ms
                      </span>
                    )}

                    {test.status === 'pass' && (
                      <span className="text-xs font-medium text-green-600">OK</span>
                    )}
                    {test.status === 'fail' && (
                      <span className="text-xs font-medium text-red-600">{test.error || 'FALHOU'}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {groups.length === 0 && !running && (
        <div className="rounded-lg p-16 text-center" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }}>
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
            <path d="m9 15 2 2 4-4"/>
          </svg>
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Clique em &quot;Testar Tudo&quot; para iniciar
          </p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Todos os testes serao executados automaticamente
          </p>
        </div>
      )}
    </div>
  )
}
