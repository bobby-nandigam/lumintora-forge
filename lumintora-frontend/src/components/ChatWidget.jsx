import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { api } from '../lib/api'

const WELCOME = {
  role: 'assistant',
  content: "Hi! I'm Lumi 👋 Lumintora's assistant. Ask me anything about the platform — features, how to get started, pricing, or anything else!",
}

export default function ChatWidget() {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef(null)
  const inputRef              = useRef(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [open, messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setLoading(true)

    try {
      const history = next.slice(1).slice(-6).map(m => ({ role: m.role, content: m.content }))
      const { reply } = await api.chat(text, history)
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Try again in a moment!" }])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  return (
    <>
      {/* Floating bubble — hidden while panel is open */}
      {!open && (
        <button
          className="chat-fab"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
        >
          <MessageCircle size={22} />
          <span className="chat-fab-ping" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <div className="chat-panel-avatar"><Bot size={16} /></div>
            <div>
              <div className="chat-panel-name">Lumi</div>
              <div className="chat-panel-status"><span className="chat-online-dot" />Online</div>
            </div>
            <button className="chat-panel-close" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={16} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg chat-msg-${m.role}`}>
                {m.role === 'assistant' && (
                  <div className="chat-msg-avatar"><Bot size={12} /></div>
                )}
                <div className="chat-msg-bubble">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg chat-msg-assistant">
                <div className="chat-msg-avatar"><Bot size={12} /></div>
                <div className="chat-msg-bubble chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <textarea
              ref={inputRef}
              className="chat-input"
              rows={1}
              placeholder="Ask about Lumintora…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
            />
            <button className="chat-send" onClick={send} disabled={!input.trim() || loading}>
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
