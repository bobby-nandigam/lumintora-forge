import { useState, useRef } from 'react'
import { runTests, show } from '../lib/judge'
import { difficultyColor } from '../lib/problems'
import { api } from '../lib/api'
import {
  Play, Send, RotateCcw, Loader2, CheckCircle2, XCircle, AlertTriangle,
  ChevronDown, Terminal, Check, Bug, Wand2, Sparkles,
} from 'lucide-react'

const LANG_LABEL = { javascript: 'JavaScript', python3: 'Python 3' }

// Tiny inline markdown: **bold**, `code`, and "- " bullet lines.
function md(text) {
  return text.split('\n').map((line, i) => {
    const bullet = line.startsWith('- ')
    const body = (bullet ? line.slice(2) : line)
      .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
      .filter(Boolean)
      .map((p, j) => {
        if (p.startsWith('**') && p.endsWith('**')) return <strong key={j}>{p.slice(2, -2)}</strong>
        if (p.startsWith('`') && p.endsWith('`')) return <code key={j}>{p.slice(1, -1)}</code>
        return <span key={j}>{p}</span>
      })
    return bullet
      ? <li key={i}>{body}</li>
      : <p key={i} className="judge-p">{body}</p>
  })
}

export default function CodeJudge({ problem, solved, onSolved }) {
  const [lang, setLang] = useState(problem.languages[0])
  const [code, setCode] = useState(problem.starters[problem.languages[0]])
  const [busy, setBusy] = useState(null)        // 'run' | 'submit' | null
  const [result, setResult] = useState(null)    // { mode, verdicts, cases, stdout, error, passed, total }
  const [aiBusy, setAiBusy] = useState(false)
  const [aiResult, setAiResult] = useState(null) // { summary, issues, fixed_code }
  const [aiError, setAiError] = useState('')
  const taRef = useRef(null)

  const visibleTests = problem.tests.filter((t) => !t.hidden)

  const switchLang = (id) => {
    setLang(id)
    setCode(problem.starters[id])
    setResult(null)
    setAiResult(null)
  }
  const reset = () => { setCode(problem.starters[lang]); setResult(null); setAiResult(null) }

  // AI assistant: review the current code for bugs, edge cases, perf issues,
  // and propose a corrected version.
  const runAiDebug = async () => {
    if (aiBusy) return
    setAiBusy(true); setAiError(''); setAiResult(null)
    try {
      const res = await api.debugCode({
        code,
        language: LANG_LABEL[lang] || lang,
        problem: `${problem.title} — ${problem.statement || ''}`,
      })
      setAiResult(res)
    } catch (e) {
      setAiError(e.message || 'AI is unavailable right now — try again in a moment.')
    } finally { setAiBusy(false) }
  }
  const applyFix = () => {
    if (aiResult?.fixed_code) { setCode(aiResult.fixed_code); setAiResult(null); setResult(null) }
  }

  const judge = async (mode) => {
    if (busy) return
    setBusy(mode)
    setResult(null)
    const cases = mode === 'submit' ? problem.tests : visibleTests
    const { verdicts, stdout, error } = await runTests(problem, lang, code, cases)
    const passed = verdicts.filter((v) => v.status === 'pass').length
    const accepted = mode === 'submit' && !error && passed === cases.length && cases.length > 0
    if (accepted) onSolved?.(problem.id)
    setResult({ mode, verdicts, cases, stdout, error, passed, total: cases.length, accepted })
    setBusy(null)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.target, s = el.selectionStart, en = el.selectionEnd
      setCode(code.slice(0, s) + '  ' + code.slice(en))
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 2 })
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      judge(e.shiftKey ? 'submit' : 'run')
    }
  }

  return (
    <div className="judge">
      {/* ── Problem statement ── */}
      <section className="judge-problem">
        <div className="judge-problem-head">
          <h2 className="judge-problem-title">{problem.title}</h2>
          {solved && <span className="judge-solved"><Check size={13} /> Solved</span>}
        </div>
        <div className="judge-meta">
          <span className="judge-diff" style={{ color: difficultyColor[problem.difficulty], background: difficultyColor[problem.difficulty] + '18' }}>
            {problem.difficulty}
          </span>
          {problem.tags.map((t) => <span key={t} className="judge-tag">{t}</span>)}
        </div>

        <div className="judge-statement">{md(problem.statement)}</div>

        <div className="judge-examples">
          {problem.examples.map((ex, i) => (
            <div key={i} className="judge-example">
              <div className="judge-example-label">Example {i + 1}</div>
              <div className="judge-example-row"><span>Input:</span> <code>{ex.input}</code></div>
              <div className="judge-example-row"><span>Output:</span> <code>{ex.output}</code></div>
              {ex.explanation && <div className="judge-example-exp">{ex.explanation}</div>}
            </div>
          ))}
        </div>

        <div className="judge-constraints">
          <div className="judge-example-label">Constraints</div>
          <ul>{problem.constraints.map((c, i) => <li key={i}><code>{c}</code></li>)}</ul>
        </div>
      </section>

      {/* ── Editor + judge ── */}
      <section className="judge-editor-col">
        <div className="code-editor">
          <div className="code-editor-header">
            <div className="runner-lang">
              <select value={lang} onChange={(e) => switchLang(e.target.value)}>
                {problem.languages.map((id) => <option key={id} value={id}>{LANG_LABEL[id]}</option>)}
              </select>
              <ChevronDown size={12} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              <button className="runner-btn runner-btn-ghost" onClick={reset} title="Reset to starter code">
                <RotateCcw size={13} /> Reset
              </button>
              <button className="runner-btn runner-btn-ai" onClick={runAiDebug} disabled={aiBusy} title="AI review: find bugs, edge cases & fixes">
                {aiBusy ? <Loader2 size={13} className="spin" /> : <Bug size={13} />} AI Debug
              </button>
              <button className="runner-btn runner-btn-ghost" onClick={() => judge('run')} disabled={!!busy} title="Run sample tests (⌘/Ctrl+Enter)">
                {busy === 'run' ? <Loader2 size={13} className="spin" /> : <Play size={13} />} Run
              </button>
              <button className="runner-btn runner-btn-run" onClick={() => judge('submit')} disabled={!!busy} title="Submit all tests (⌘/Ctrl+Shift+Enter)">
                {busy === 'submit' ? <Loader2 size={13} className="spin" /> : <Send size={13} />} Submit
              </button>
            </div>
          </div>
          <textarea
            ref={taRef}
            className="code-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            style={{ height: 340 }}
          />
        </div>

        {/* Results */}
        <div className="judge-results">
          {busy && (
            <div className="judge-running">
              <Loader2 size={14} className="spin" /> {busy === 'submit' ? 'Judging all test cases…' : 'Running sample tests…'}
              {lang !== 'javascript' && <span className="runner-muted"> · on the server</span>}
            </div>
          )}

          {!busy && !result && (
            <div className="judge-hint">
              <Terminal size={13} /> Run the {visibleTests.length} sample tests, or Submit to judge all {problem.tests.length} (including hidden) cases.
            </div>
          )}

          {!busy && result && <Results result={result} />}
        </div>

        {/* AI assistant panel */}
        {(aiBusy || aiResult || aiError) && (
          <div className="ai-panel">
            <div className="ai-panel-head"><Sparkles size={14} /> AI Assistant · review &amp; debug</div>
            {aiBusy && <div className="judge-running"><Loader2 size={14} className="spin" /> Reviewing your code for bugs, edge cases and performance…</div>}
            {aiError && <div className="ai-panel-err"><AlertTriangle size={14} /> {aiError}</div>}
            {aiResult && (
              <>
                <p className="ai-panel-summary">{aiResult.summary}</p>
                {(aiResult.issues || []).length > 0 ? (
                  <div className="ai-issues">
                    {aiResult.issues.map((it, i) => (
                      <div key={i} className={`ai-issue sev-${it.severity || 'warning'}`}>
                        <div className="ai-issue-head">
                          <span className="ai-issue-sev">{it.severity || 'note'}</span>
                          <span className="ai-issue-title">{it.title}</span>
                        </div>
                        {it.detail && <div className="ai-issue-detail">{it.detail}</div>}
                        {it.fix && <div className="ai-issue-fix"><Wand2 size={12} /> {it.fix}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ai-clean"><CheckCircle2 size={14} /> No real issues found — looks solid.</div>
                )}
                {aiResult.fixed_code && aiResult.fixed_code.trim() && (
                  <div className="ai-fix-block">
                    <div className="ai-fix-head">
                      <span>Suggested fix</span>
                      <button className="runner-btn runner-btn-run" onClick={applyFix}><Wand2 size={13} /> Apply to editor</button>
                    </div>
                    <pre className="ai-fix-code">{aiResult.fixed_code}</pre>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function Results({ result }) {
  const { mode, verdicts, cases, stdout, error, passed, total, accepted } = result

  return (
    <div>
      {mode === 'submit' && !error && (
        <div className={`judge-verdict ${accepted ? 'ok' : 'bad'}`}>
          {accepted
            ? <><CheckCircle2 size={18} /> <strong>Accepted</strong> · {passed}/{total} test cases passed</>
            : <><XCircle size={18} /> <strong>Wrong Answer</strong> · {passed}/{total} test cases passed</>}
        </div>
      )}

      {error && (
        <div className="judge-verdict bad">
          <AlertTriangle size={18} /> <strong>{mode === 'submit' ? 'Runtime / Compile Error' : 'Error'}</strong>
        </div>
      )}
      {error && <pre className="judge-error">{error}</pre>}

      {!error && (
        <div className="judge-cases">
          {verdicts.map((v, i) => {
            const t = cases[i]
            return (
              <div key={i} className={`judge-case judge-case-${v.status}`}>
                <div className="judge-case-head">
                  {v.status === 'pass' ? <CheckCircle2 size={14} /> : v.status === 'fail' ? <XCircle size={14} /> : <AlertTriangle size={14} />}
                  <span className="judge-case-name">Case {i + 1}{t.hidden ? ' · hidden' : ''}</span>
                  <span className="judge-case-status">{v.status === 'pass' ? 'Passed' : v.status === 'fail' ? 'Wrong answer' : 'Error'}</span>
                </div>
                <div className="judge-case-body">
                  <Row label="Input" value={t.input.map(show).join(', ')} />
                  <Row label="Expected" value={show(v.expected)} />
                  {v.status === 'fail' && <Row label="Got" value={show(v.got)} bad />}
                  {v.status === 'error' && <Row label="Error" value={v.error} bad />}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!error && stdout?.length > 0 && (
        <details className="judge-stdout">
          <summary><Terminal size={12} /> Your stdout ({stdout.length} {stdout.length === 1 ? 'line' : 'lines'})</summary>
          <pre>{stdout.join('\n')}</pre>
        </details>
      )}
    </div>
  )
}

const Row = ({ label, value, bad }) => (
  <div className="judge-row">
    <span className="judge-row-label">{label}</span>
    <code className={`judge-row-val ${bad ? 'bad' : ''}`}>{value}</code>
  </div>
)
