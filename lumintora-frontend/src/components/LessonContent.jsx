import { useState, useEffect, useRef } from 'react'
import { Copy, Check, Info, Lightbulb, AlertTriangle, KeyRound, Loader2 } from 'lucide-react'

// ════════════════════════════════════════════════════════════
//  Rich lesson renderer
//  Turns the AI's GitHub-flavored Markdown into a real visual lesson:
//  live Mermaid diagrams, callout cards, copy-able code, tables, TL;DR.
//  This is the bit that makes a Lumintora lesson feel unlike a chat reply.
// ════════════════════════════════════════════════════════════

const cssVar = (name, fallback) => {
  if (typeof window === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

// One id counter per page load so each diagram gets a unique render target.
let mermaidSeq = 0

function Mermaid({ code }) {
  const ref = useRef(null)
  const [err, setErr] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    setErr(false); setReady(false)
    ;(async () => {
      try {
        const mermaid = (await import('mermaid')).default
        const accent = cssVar('--accent', '#7140ff')
        const accentSoft = cssVar('--accent-soft', 'rgba(113,64,255,0.08)')
        const ink = cssVar('--text', '#1a1626')
        const line = cssVar('--border-2', '#cbd5e1')
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          fontFamily: cssVar('--font-body', 'Inter, sans-serif'),
          themeVariables: {
            primaryColor: accentSoft,
            primaryBorderColor: accent,
            primaryTextColor: ink,
            lineColor: line,
            secondaryColor: '#f5f3f9',
            tertiaryColor: '#ffffff',
            fontSize: '14px',
          },
        })
        const id = `mmd-${++mermaidSeq}`
        const { svg } = await mermaid.render(id, code.trim())
        if (active && ref.current) { ref.current.innerHTML = svg; setReady(true) }
      } catch (e) {
        if (active) setErr(true)
      }
    })()
    return () => { active = false }
  }, [code])

  if (err) {
    // Fall back to showing the diagram source rather than nothing.
    return <pre className="lc-pre"><code>{code}</code></pre>
  }
  return (
    <div className="lc-diagram">
      {!ready && (
        <div className="lc-diagram-loading">
          <Loader2 size={16} className="spin" /> Rendering diagram…
        </div>
      )}
      <div ref={ref} className="lc-diagram-svg" />
    </div>
  )
}

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {}
  }
  return (
    <div className="lc-code">
      <div className="lc-code-bar">
        <span className="lc-code-lang">{lang || 'code'}</span>
        <button className="lc-code-copy" onClick={copy}>
          {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <pre className="lc-pre"><code>{code}</code></pre>
    </div>
  )
}

const CALLOUTS = {
  KEY:     { icon: KeyRound,      cls: 'lc-callout-key',  label: 'Key idea' },
  TIP:     { icon: Lightbulb,     cls: 'lc-callout-tip',  label: 'Tip' },
  WARNING: { icon: AlertTriangle, cls: 'lc-callout-warn', label: 'Watch out' },
  NOTE:    { icon: Info,          cls: 'lc-callout-note', label: 'Note' },
}

function Callout({ kind, children }) {
  const c = CALLOUTS[kind] || CALLOUTS.NOTE
  const Icon = c.icon
  return (
    <div className={`lc-callout ${c.cls}`}>
      <div className="lc-callout-head"><Icon size={15} /> {c.label}</div>
      <div className="lc-callout-body">{children}</div>
    </div>
  )
}

// ── inline: **bold**, `code`, [text](url) ──
function renderInline(text, key) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean)
  return parts.map((p, i) => {
    const k = `${key}-${i}`
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={k}>{p.slice(2, -2)}</strong>
    if (p.startsWith('`') && p.endsWith('`')) return <code key={k}>{p.slice(1, -1)}</code>
    const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) return <a key={k} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>
    return <span key={k}>{p}</span>
  })
}

const isTableSep = (l) => /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(l) && l.includes('-')
const splitRow = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())

export default function LessonContent({ text }) {
  if (!text) return null
  const lines = text.replace(/\r/g, '').split('\n')
  const out = []
  let i = 0, key = 0

  const flushList = (items, ordered) => {
    out.push(ordered
      ? <ol className="lc-ol" key={key++}>{items.map((it, n) => <li key={n}>{renderInline(it, `ol${key}-${n}`)}</li>)}</ol>
      : <ul className="lc-ul" key={key++}>{items.map((it, n) => <li key={n}><span className="lc-dot" />{renderInline(it, `ul${key}-${n}`)}</li>)}</ul>
    )
  }

  while (i < lines.length) {
    const line = lines[i]

    // fenced code / mermaid
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim().toLowerCase()
      const buf = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) { buf.push(lines[i]); i++ }
      i++ // closing fence
      const code = buf.join('\n')
      out.push(lang === 'mermaid'
        ? <Mermaid key={key++} code={code} />
        : <CodeBlock key={key++} lang={lang} code={code} />)
      continue
    }

    // callout: > [!KIND] ...
    const cm = line.match(/^>\s*\[!(\w+)\]\s*(.*)$/)
    if (cm) {
      const kind = cm[1].toUpperCase()
      const buf = cm[2] ? [cm[2]] : []
      i++
      while (i < lines.length && lines[i].startsWith('>')) { buf.push(lines[i].replace(/^>\s?/, '')); i++ }
      out.push(<Callout key={key++} kind={kind}>{buf.map((b, n) => <p key={n}>{renderInline(b, `co${key}-${n}`)}</p>)}</Callout>)
      continue
    }

    // plain blockquote
    if (line.startsWith('>')) {
      const buf = []
      while (i < lines.length && lines[i].startsWith('>')) { buf.push(lines[i].replace(/^>\s?/, '')); i++ }
      out.push(<blockquote className="lc-quote" key={key++}>{renderInline(buf.join(' '), `q${key}`)}</blockquote>)
      continue
    }

    // GFM table
    if (line.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const header = splitRow(line)
      i += 2
      const body = []
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') { body.push(splitRow(lines[i])); i++ }
      out.push(
        <div className="lc-table-wrap" key={key++}>
          <table className="lc-table">
            <thead><tr>{header.map((h, n) => <th key={n}>{renderInline(h, `th${key}-${n}`)}</th>)}</tr></thead>
            <tbody>{body.map((row, ri) => <tr key={ri}>{row.map((c, ci) => <td key={ci}>{renderInline(c, `td${key}-${ri}-${ci}`)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )
      continue
    }

    // headings
    if (line.startsWith('### ')) { out.push(<h3 className="lc-h3" key={key++}>{renderInline(line.slice(4), key)}</h3>); i++; continue }
    if (line.startsWith('## '))  { out.push(<h2 className="lc-h2" key={key++}>{renderInline(line.slice(3), key)}</h2>); i++; continue }
    if (line.startsWith('# '))   { out.push(<h2 className="lc-h2" key={key++}>{renderInline(line.slice(2), key)}</h2>); i++; continue }

    // TL;DR strip
    const tldr = line.replace(/\*\*/g, '').match(/^TL;DR[:\s-]+(.*)$/i)
    if (tldr && tldr[1]) {
      out.push(<div className="lc-tldr" key={key++}><span className="lc-tldr-tag">TL;DR</span>{renderInline(tldr[1], `tldr${key}`)}</div>)
      i++; continue
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++ }
      flushList(items, true); continue
    }

    // bullet list
    if (/^\s*[-*]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++ }
      flushList(items, false); continue
    }

    if (line.trim() === '') { i++; continue }
    out.push(<p className="lc-p" key={key++}>{renderInline(line, key)}</p>)
    i++
  }

  return <div className="lc">{out}</div>
}
