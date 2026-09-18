import { useState, useRef } from 'react'
import { api } from '../lib/api'
import { runJs } from '../lib/runJs'
import { Button } from './UI'
import { Play, RotateCcw, Sparkles, Terminal, Loader2, CheckCircle2, XCircle, ChevronDown } from 'lucide-react'

// Reusable hands-on code practice.
//   • JavaScript  → runs instantly in a sandboxed Web Worker (offline, no server)
//   • Python 3 / Java → run on the backend execution gateway (real CPython / JVM)
// Used inside lesson modules and on the standalone /playground.

export const LANGS = [
  { id: 'javascript', label: 'JavaScript', file: 'solution.js', local: true },
  { id: 'python3', label: 'Python 3', file: 'main.py', local: false },
  { id: 'java', label: 'Java', file: 'Main.java', local: false },
]

export const STARTERS = {
  javascript: `// JavaScript runs instantly in your browser.
function greet(name) {
  return "Hello, " + name + "!";
}
console.log(greet("Lumintora"));
`,
  python3: `# Python 3 runs on the server (real CPython).
def greet(name):
    return f"Hello, {name}!"

print(greet("Lumintora"))
print(sum(range(1, 11)))
`,
  java: `// Java compiles & runs on the server (real JVM).
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Lumintora!");
        int sum = 0;
        for (int i = 1; i <= 10; i++) sum += i;
        System.out.println("Sum 1..10 = " + sum);
    }
}
`,
}

const langMeta = (id) => LANGS.find(l => l.id === id) || LANGS[0]

export default function CodeRunner({
  initialCode,
  initialLanguage = 'javascript',
  languages = ['javascript', 'python3', 'java'],
  problem = 'this exercise',
  height = 280,
}) {
  const [lang, setLang] = useState(initialLanguage)
  const [code, setCode] = useState(initialCode ?? STARTERS[initialLanguage] ?? STARTERS.javascript)
  const [stdin, setStdin] = useState('')
  const [showStdin, setShowStdin] = useState(false)
  const [output, setOutput] = useState(null)
  const [running, setRunning] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const taRef = useRef(null)

  const meta = langMeta(lang)
  const isLocal = meta.local
  const showSelector = languages.length > 1

  const switchLang = (id) => {
    setLang(id)
    setCode(STARTERS[id] ?? '')
    setOutput(null)
    setFeedback('')
  }

  const run = async () => {
    setRunning(true)
    setOutput(null)
    if (isLocal) {
      const res = await runJs(code, { timeout: 3000 })
      setOutput({ kind: 'js', ...res })
    } else {
      try {
        const res = await api.execute({ language: lang, source: code, stdin })
        setOutput({ kind: 'remote', ...res })
      } catch (e) {
        setOutput({ kind: 'remote', ok: false, stdout: '', stderr: e.message || 'Run failed', exit_code: null })
      }
    }
    setRunning(false)
  }

  const reset = () => { setCode(initialCode ?? STARTERS[lang] ?? ''); setOutput(null); setFeedback('') }

  const evaluate = async () => {
    setEvaluating(true)
    try {
      const res = await api.evaluateCode({ code, language: lang, problem })
      setFeedback(res.feedback)
    } catch { setFeedback('Could not evaluate right now.') }
    setEvaluating(false)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.target, s = el.selectionStart, en = el.selectionEnd
      setCode(code.slice(0, s) + '  ' + code.slice(en))
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 2 })
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run() }
  }

  // Normalize both execution paths into a single console view.
  const lines = []
  if (output?.kind === 'js') {
    (output.logs || []).forEach(l => lines.push(l))
    if (output.error) lines.push({ level: 'error', text: output.error })
  } else if (output?.kind === 'remote') {
    if (output.stdout) output.stdout.split('\n').forEach(t => lines.push({ level: 'log', text: t }))
    if (output.stderr) output.stderr.split('\n').forEach(t => lines.push({ level: 'error', text: t }))
  }
  const footer = output?.kind === 'js'
    ? (output.ret !== undefined ? `⟵ returned: ${output.ret}` : '')
    : (output && output.exit_code != null ? `exited with code ${output.exit_code}${output.compiler ? ' · ' + output.compiler : ''}` : '')
  const ranOk = output?.ok

  return (
    <div>
      <div className="code-editor">
        <div className="code-editor-header">
          <div className="code-editor-dots">
            <div className="code-editor-dot" style={{ background: '#ff5f57' }} />
            <div className="code-editor-dot" style={{ background: '#febc2e' }} />
            <div className="code-editor-dot" style={{ background: '#28c840' }} />
          </div>

          {showSelector ? (
            <div className="runner-lang">
              <select value={lang} onChange={e => switchLang(e.target.value)}>
                {languages.map(id => <option key={id} value={id}>{langMeta(id).label}</option>)}
              </select>
              <ChevronDown size={12} />
            </div>
          ) : (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{meta.file}</span>
          )}

          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button className="runner-btn runner-btn-ghost" onClick={reset} title="Reset">
              <RotateCcw size={13} /> Reset
            </button>
            <button className="runner-btn runner-btn-run" onClick={run} disabled={running} title="Run (⌘/Ctrl+Enter)">
              {running ? <Loader2 size={13} className="spin" /> : <Play size={13} />} Run
            </button>
          </div>
        </div>
        <textarea
          ref={taRef}
          className="code-textarea"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          style={{ height }}
        />
      </div>

      {/* Optional stdin for server languages */}
      {!isLocal && (
        <div className="runner-stdin">
          <button className="runner-stdin-toggle" onClick={() => setShowStdin(s => !s)}>
            <ChevronDown size={13} style={{ transform: showStdin ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .15s' }} />
            Standard input (stdin)
          </button>
          {showStdin && (
            <textarea
              className="runner-stdin-area"
              value={stdin}
              onChange={e => setStdin(e.target.value)}
              placeholder="Lines here are fed to your program's input()/Scanner…"
              rows={3}
              spellCheck={false}
            />
          )}
        </div>
      )}

      {running && !isLocal && (
        <div className="runner-output">
          <div className="runner-console"><span className="runner-muted">Compiling & running on the server…</span></div>
        </div>
      )}

      {output && !(running && !isLocal) && (
        <div className={`runner-output ${ranOk ? '' : 'runner-output-err'}`}>
          <div className="runner-output-head">
            <Terminal size={13} /> Console
            <span className="runner-output-status">
              {ranOk ? <><CheckCircle2 size={13} /> ran successfully</> : <><XCircle size={13} /> {output.compiled === false ? 'compile error' : 'error'}</>}
            </span>
          </div>
          <div className="runner-console">
            {lines.length === 0 && ranOk && !footer && (
              <div className="runner-line runner-muted">// no output — try printing something</div>
            )}
            {lines.map((l, i) => <div key={i} className={`runner-line runner-${l.level}`}>{l.text}</div>)}
            {footer && <div className={`runner-line ${output.kind === 'js' ? 'runner-ret' : 'runner-muted'}`} style={{ marginTop: 4 }}>{footer}</div>}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
        <Button onClick={evaluate} loading={evaluating} variant="secondary" size="md">
          <Sparkles size={14} /> AI review
        </Button>
      </div>

      {feedback && (
        <div className="ai-panel" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Sparkles size={15} color="var(--accent)" />
            <span style={{ fontSize: 14, fontWeight: 600 }}>AI feedback</span>
          </div>
          <div className="ai-response">{feedback}</div>
        </div>
      )}
    </div>
  )
}
