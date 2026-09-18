import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'
import { hasWebGPU, getEngine, streamLocal, LOCAL_MODEL } from '../lib/localLLM'
import { Sparkles, X, Send, MessageSquare, Cpu, Cloud, Loader2, TextSelect } from 'lucide-react'

const SYS = "You are Lumi, Lumintora's friendly, concise learning tutor. Explain clearly with simple language and short examples. When the user shares selected text as context, focus your answer on it."

const GREETING = {
  role: 'assistant',
  content: "Hi, I'm **Lumi** — your learning tutor. Ask me anything, or **select any text** in a lesson and I'll explain it right here.",
}

export default function AiChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [context, setContext] = useState('')        // selected text awaiting a question
  const [selBtn, setSelBtn] = useState(null)         // { x, y, text } floating "Ask Lumi" button
  const [thinking, setThinking] = useState(false)
  const [loading, setLoading] = useState(false)      // model downloading
  const [progress, setProgress] = useState(null)     // { pct, text }
  const [mode, setMode] = useState(hasWebGPU() ? 'local' : 'cloud')

  const engineRef = useRef(null)
  const panelRef = useRef(null)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  // Selecting text no longer hijacks the chat. Instead we surface a small
  // "Ask Lumi" button by the selection — so plain copying is left untouched, and
  // sending a snippet to the tutor is an explicit, opt-in click.
  useEffect(() => {
    const onUp = (e) => {
      const sel = window.getSelection?.()
      const text = sel?.toString().trim() || ''
      if (text.length < 3 || text.length > 1500) { setSelBtn(null); return }
      // Ignore selections made inside the chat panel itself.
      if (panelRef.current && sel.anchorNode && panelRef.current.contains(sel.anchorNode)) return
      setSelBtn({ x: e.clientX, y: e.clientY, text })
    }
    // Starting a new selection / clicking elsewhere dismisses the button,
    // but clicking the button itself must not.
    const onDown = (e) => {
      if (e.target.closest?.('.aichat-sel-btn')) return
      setSelBtn(null)
    }
    const dismiss = () => setSelBtn(null)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('scroll', dismiss, true)
    return () => {
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', dismiss, true)
    }
  }, [])

  const askSelection = () => {
    if (!selBtn) return
    setContext(selBtn.text)
    setSelBtn(null)
    setOpen(true)
  }

  // Auto-scroll + focus.
  useEffect(() => { bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' }) }, [messages, thinking, loading])
  useEffect(() => { if (open) inputRef.current?.focus() }, [open, context])

  const toLLM = (m) => ({ role: m.role, content: m.ctx ? `${m.content}\n\nSelected text:\n"""${m.ctx}"""` : m.content })

  const ask = async (question, ctx) => {
    const userMsg = { role: 'user', content: question, ctx: ctx || '' }
    const convo = [{ role: 'system', content: SYS }, ...messages.filter(m => m.content).map(toLLM), toLLM(userMsg)]
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }])
    setThinking(true)
    try {
      if (hasWebGPU()) {
        setMode('local')
        if (!engineRef.current) {
          setLoading(true)
          engineRef.current = await getEngine(r => setProgress({ pct: Math.round((r.progress || 0) * 100), text: r.text || '' }))
          setLoading(false)
        }
        await streamLocal(engineRef.current, convo, (delta) => {
          setMessages(prev => {
            const c = [...prev]
            c[c.length - 1] = { ...c[c.length - 1], content: c[c.length - 1].content + delta }
            return c
          })
        })
      } else {
        // Cloud fallback — the existing backend tutor.
        setMode('cloud')
        const res = await api.explain({ concept: question, context: ctx || 'general learning' })
        setMessages(prev => {
          const c = [...prev]
          c[c.length - 1] = { role: 'assistant', content: res.explanation || 'No response.' }
          return c
        })
      }
    } catch (e) {
      setLoading(false)
      setMessages(prev => {
        const c = [...prev]
        c[c.length - 1] = { role: 'assistant', content: `Sorry — ${e?.message || 'the model failed to respond'}.` }
        return c
      })
    }
    setThinking(false)
  }

  const send = () => {
    const q = input.trim()
    if (!q || thinking || loading) return
    setInput('')
    const ctx = context
    setContext('')
    ask(q, ctx)
  }

  const explainSelection = () => {
    if (!context || thinking || loading) return
    const ctx = context
    setContext('')
    ask('Explain this clearly and simply.', ctx)
  }

  // Light markdown for assistant bubbles (**bold**, `code`).
  const fmt = (text) => text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i}>{p.slice(1, -1)}</code>
    return <span key={i}>{p}</span>
  })

  return (
    <>
      {/* Opt-in: appears by a text selection so copying is never hijacked. */}
      {selBtn && (
        <button
          className="aichat-sel-btn"
          style={{ left: selBtn.x, top: selBtn.y + 14 }}
          onMouseDown={(e) => e.preventDefault()}  // keep the text selection alive
          onClick={askSelection}
        >
          <Sparkles size={13} /> Ask Lumi
        </button>
      )}

      {!open && (
        <button className="aichat-fab" onClick={() => setOpen(true)} aria-label="Open Lumi, your AI tutor">
          <Sparkles size={22} />
          {context && <span className="aichat-fab-dot" />}
        </button>
      )}

      {open && (
        <div className="aichat-panel" ref={panelRef}>
          <div className="aichat-head">
            <div className="aichat-head-title">
              <span className="aichat-avatar"><Sparkles size={15} /></span>
              <div>
                <div className="aichat-name">Lumi</div>
                <div className="aichat-mode">
                  {mode === 'local'
                    ? <><Cpu size={11} /> Local · in-browser</>
                    : <><Cloud size={11} /> Cloud tutor</>}
                </div>
              </div>
            </div>
            <button className="aichat-x" onClick={() => setOpen(false)} aria-label="Close"><X size={17} /></button>
          </div>

          {loading && (
            <div className="aichat-loading">
              <div className="aichat-loading-row"><Loader2 size={13} className="spin" /> Loading local model ({LOCAL_MODEL.split('-').slice(0, 3).join(' ')})…</div>
              <div className="aichat-progress"><div className="aichat-progress-fill" style={{ width: `${progress?.pct || 2}%` }} /></div>
              <div className="aichat-loading-note">{progress?.pct >= 100 ? 'Almost ready…' : 'First load downloads the model once, then it’s cached & offline.'}</div>
            </div>
          )}

          <div className="aichat-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`aichat-msg aichat-${m.role}`}>
                {m.ctx && (
                  <div className="aichat-ctx-chip"><TextSelect size={11} /> {m.ctx.length > 90 ? m.ctx.slice(0, 90) + '…' : m.ctx}</div>
                )}
                <div className="aichat-bubble">{m.content ? fmt(m.content) : <span className="aichat-typing"><span /><span /><span /></span>}</div>
              </div>
            ))}
          </div>

          {context && (
            <div className="aichat-context">
              <div className="aichat-context-text"><TextSelect size={13} /> {context.length > 110 ? context.slice(0, 110) + '…' : context}</div>
              <div className="aichat-context-actions">
                <button className="aichat-ctx-btn" onClick={explainSelection} disabled={thinking || loading}>Explain this</button>
                <button className="aichat-ctx-x" onClick={() => setContext('')} aria-label="Clear">×</button>
              </div>
            </div>
          )}

          <div className="aichat-input">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder={context ? 'Ask about the selected text…' : 'Ask your tutor anything…'}
              rows={1}
            />
            <button className="aichat-send" onClick={send} disabled={!input.trim() || thinking || loading} aria-label="Send">
              {thinking || loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
