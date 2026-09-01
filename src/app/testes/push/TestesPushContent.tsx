'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Usuario {
  id: number
  nome: string
  email: string
  notificacoesAtivas: boolean
  notificarComentarios: boolean
  notificarSistema: boolean
  inscricoes: { id: number; endpoint: string; criadoEm: string }[]
}

interface LogEnvio {
  key: string
  timestamp: string
  tipo: 'sistema' | 'comentario'
  destinatario: string
  destinatarioId: number
  resultado: 'enviado' | 'bloqueado' | 'erro'
  motivo?: string
  titulo: string
}

export default function TestesPushContent() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<LogEnvio[]>([])
  const logCounter = useRef(0)
  const [titulo, setTitulo] = useState('Teste Push')
  const [mensagem, setMensagem] = useState('Notificação de teste')
  const [url, setUrl] = useState('/')
  const [enviando, setEnviando] = useState<number | null>(null)
  const [filtro, setFiltro] = useState<'todos' | 'ativos' | 'com inscricao'>('todos')

  const fetchUsuarios = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications/list-users')
      const data = await res.json()
      setUsuarios(data.usuarios || [])
    } catch {
      console.error('Erro ao buscar usuários')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchUsuarios()
  }, [fetchUsuarios])

  const addLog = useCallback((log: Omit<LogEnvio, 'key' | 'timestamp'>) => {
    logCounter.current++
    const key = `${logCounter.current}-${Date.now()}`
    setLogs((prev) => [{ ...log, key, timestamp: new Date().toLocaleTimeString('pt-BR') }, ...prev].slice(0, 50))
  }, [])

  const verificarSeReceberia = (u: Usuario, tipo: 'sistema' | 'comentario') => {
    if (!u.notificacoesAtivas) return { receberia: false, motivo: 'Notificações desativadas' }
    if (tipo === 'comentario' && !u.notificarComentarios) return { receberia: false, motivo: 'Tipo comentário desativado' }
    if (tipo === 'sistema' && !u.notificarSistema) return { receberia: false, motivo: 'Tipo sistema desativado' }
    if (u.inscricoes.length === 0) return { receberia: false, motivo: 'Sem inscrições push' }
    return { receberia: true, motivo: null }
  }

  const enviarParaUsuario = async (u: Usuario, tipo: 'sistema' | 'comentario') => {
    setEnviando(u.id)
    const verificacao = verificarSeReceberia(u, tipo)

    if (!verificacao.receberia) {
      addLog({ tipo, destinatario: u.nome, destinatarioId: u.id, resultado: 'bloqueado', motivo: verificacao.motivo || undefined, titulo })
      setEnviando(null)
      return
    }

    try {
      const res = await fetch('/api/notifications/test-push-individual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: u.id, titulo, mensagem, url, tipo }),
      })
      const data = await res.json()
      addLog({ tipo, destinatario: u.nome, destinatarioId: u.id, resultado: data.enviadosComSucesso > 0 ? 'enviado' : 'erro', titulo })
    } catch {
      addLog({ tipo, destinatario: u.nome, destinatarioId: u.id, resultado: 'erro', motivo: 'Erro na requisição', titulo })
    }
    setEnviando(null)
  }

  const enviarParaTodos = async (tipo: 'sistema' | 'comentario') => {
    setEnviando(-1)
    try {
      await fetch('/api/notifications/test-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, mensagem, url, tipo }),
      })

      for (const u of usuarios) {
        const verificacao = verificarSeReceberia(u, tipo)
        addLog({ tipo, destinatario: u.nome, destinatarioId: u.id, resultado: verificacao.receberia ? 'enviado' : 'bloqueado', motivo: verificacao.motivo || undefined, titulo })
      }
    } catch {
      addLog({ tipo, destinatario: 'Todos', destinatarioId: 0, resultado: 'erro', motivo: 'Erro na requisição', titulo })
    }
    setEnviando(null)
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    if (filtro === 'ativos') return u.notificacoesAtivas
    if (filtro === 'com inscricao') return u.inscricoes.length > 0
    return true
  })

  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter((u) => u.notificacoesAtivas).length,
    comInscricao: usuarios.filter((u) => u.inscricoes.length > 0).length,
    receberiamSistema: usuarios.filter((u) => verificarSeReceberia(u, 'sistema').receberia).length,
    receberiamComentario: usuarios.filter((u) => verificarSeReceberia(u, 'comentario').receberia).length,
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        Painel de Testes - Push Notifications
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-lg p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <h2 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Resumo</h2>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total}</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{stats.ativos}</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Ativos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-500">{stats.comInscricao}</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Com Push</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">{stats.receberiamSistema}</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Receberiam Sistema</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-500">{stats.receberiamComentario}</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Receberiam Coment.</div>
              </div>
            </div>
          </section>

          <section className="rounded-lg p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <h2 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Mensagem</h2>
            <div className="grid grid-cols-3 gap-3">
              <input type="text" placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              <input type="text" placeholder="Mensagem" value={mensagem} onChange={(e) => setMensagem(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              <input type="text" placeholder="URL (opcional)" value={url} onChange={(e) => setUrl(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <div className="flex gap-3 mt-3">
              <button onClick={() => enviarParaTodos('sistema')} disabled={enviando !== null}
                className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50" style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}>
                Enviar Todos - Sistema
              </button>
              <button onClick={() => enviarParaTodos('comentario')} disabled={enviando !== null}
                className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50" style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}>
                Enviar Todos - Comentário
              </button>
              <button onClick={() => { setLogs([]); fetchUsuarios() }}
                className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--text-primary)' }}>
                Atualizar
              </button>
            </div>
          </section>

          <section className="rounded-lg p-5" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium" style={{ color: 'var(--text-primary)' }}>Usuários ({usuariosFiltrados.length})</h2>
              <div className="flex gap-2">
                {(['todos', 'ativos', 'com inscricao'] as const).map((f) => (
                  <button key={f} onClick={() => setFiltro(f)} className="px-3 py-1 rounded text-xs"
                    style={{ backgroundColor: filtro === f ? 'var(--btn-primary-bg)' : 'var(--btn-secondary-bg)', color: filtro === f ? 'var(--btn-primary-text)' : 'var(--text-primary)' }}>
                    {f === 'todos' ? 'Todos' : f === 'ativos' ? 'Ativos' : 'Com Push'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Carregando...</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {usuariosFiltrados.map((u) => {
                  const verifSistema = verificarSeReceberia(u, 'sistema')
                  const verifComentario = verificarSeReceberia(u, 'comentario')
                  return (
                    <div key={u.id} className="rounded-lg p-3 flex items-center gap-4"
                      style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{u.nome}</span>
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>({u.email})</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs">
                            <span className={`w-1.5 h-1.5 rounded-full ${u.notificacoesAtivas ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span style={{ color: 'var(--text-tertiary)' }}>Geral</span>
                          </span>
                          <span className="flex items-center gap-1 text-xs">
                            <span className={`w-1.5 h-1.5 rounded-full ${u.notificarComentarios ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span style={{ color: 'var(--text-tertiary)' }}>Coment.</span>
                          </span>
                          <span className="flex items-center gap-1 text-xs">
                            <span className={`w-1.5 h-1.5 rounded-full ${u.notificarSistema ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span style={{ color: 'var(--text-tertiary)' }}>Sistema</span>
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{u.inscricoes.length} push</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => enviarParaUsuario(u, 'sistema')} disabled={enviando !== null}
                          className="px-2 py-1 rounded text-xs disabled:opacity-50"
                          style={{ backgroundColor: verifSistema.receberia ? '#16a34a20' : '#dc262620', color: verifSistema.receberia ? '#16a34a' : '#dc2626', border: `1px solid ${verifSistema.receberia ? '#16a34a40' : '#dc262640'}` }}>
                          {enviando === u.id ? '...' : 'Sistema'}
                        </button>
                        <button onClick={() => enviarParaUsuario(u, 'comentario')} disabled={enviando !== null}
                          className="px-2 py-1 rounded text-xs disabled:opacity-50"
                          style={{ backgroundColor: verifComentario.receberia ? '#16a34a20' : '#dc262620', color: verifComentario.receberia ? '#16a34a' : '#dc2626', border: `1px solid ${verifComentario.receberia ? '#16a34a40' : '#dc262640'}` }}>
                          {enviando === u.id ? '...' : 'Coment.'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        <div>
          <section className="rounded-lg p-5 sticky top-6" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium" style={{ color: 'var(--text-primary)' }}>Log de Envios ({logs.length})</h2>
              <button onClick={() => setLogs([])} className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Limpar</button>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Nenhum envio registrado</p>
              ) : (
                logs.map((log) => (
                  <div key={log.key} className="rounded-lg p-2 text-xs"
                    style={{ backgroundColor: log.resultado === 'enviado' ? '#dcfce710' : log.resultado === 'bloqueado' ? '#fef3c710' : '#fee2e210', border: `1px solid ${log.resultado === 'enviado' ? '#16a34a30' : log.resultado === 'bloqueado' ? '#f59e0b30' : '#dc262630'}` }}>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${log.resultado === 'enviado' ? 'bg-green-500' : log.resultado === 'bloqueado' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{log.destinatario}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>({log.tipo})</span>
                    </div>
                    {log.motivo && <p className="mt-1 ml-3.5" style={{ color: 'var(--text-tertiary)' }}>{log.motivo}</p>}
                    <p className="mt-1 ml-3.5" style={{ color: 'var(--text-tertiary)' }}>{log.timestamp}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
