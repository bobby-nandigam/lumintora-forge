import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import Nav, { Sidebar } from '../components/Nav'
import { Spinner } from '../components/UI'
import { masteryColor } from './ForgeHome'
import {
  RefreshCw, ArrowRight, ArrowLeft, Clock, Lightbulb, CheckCircle2,
  Sparkles, Trophy, Target, Loader2,
} from 'lucide-react'
import '../components/UI.css'
import './Forge.css'

const MINUTE_OPTIONS = [7, 10, 15]

export default function ForgeRefresh() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const queryTopic = params.get('topic')
  const queryMinutes = parseInt(params.get('minutes') || '', 10)

  // step: setup | diagnostic | results | session | complete
  const [step, setStep] = useState('setup')
  const [topics, setTopics] = useState([])
  const [topicKey, setTopicKey] = useState(queryTopic || '')
  const [minutes, setMinutes] = useState(Number.isFinite(queryMinutes) ? queryMinutes : 10)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [session, setSession] = useState(null)          // {session_id, topic_name, questions}
  const [answers, setAnswers] = useState({})            // slug -> text
  const [results, setResults] = useState(null)          // {classification, plan, narrative}

  // Load topics for the setup grid
  useEffect(() => {
    api.forgeSkills().then(d => setTopics(d.memory || [])).catch(() => {})
  }, [])

  // If a topic was passed in the URL, auto-start.
  useEffect(() => {
    if (queryTopic) start(queryTopic, Number.isFinite(queryMinutes) ? queryMinutes : 10)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function start(tk, mins) {
    setBusy(true); setError('')
    try {
      const s = await api.forgeStart({ topic_key: tk, minutes: mins })
      setSession(s); setStep('diagnostic')
    } catch (e) {
      setError(e.message || 'Could not start a refresh')
    } finally { setBusy(false) }
  }

  async function submitDiagnostic() {
    setBusy(true); setError('')
    try {
      const payload = session.questions.map(q => ({ slug: q.slug, response: answers[q.slug] || '' }))
      const r = await api.forgeDiagnostic(session.session_id, payload)
      setResults(r); setStep('results')
    } catch (e) {
      setError(e.message || 'Could not evaluate your answers')
    } finally { setBusy(false) }
  }

  return (
    <div>
      <Nav />
      <div className="layout">
        <Sidebar />
        <main className="main animate-fade">
          <div className="forge-session">
            <Link to="/forge" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
              <ArrowLeft size={14} /> Forge
            </Link>

            {error && <div className="sess-feedback mid" style={{ marginBottom: 16 }}>{error}</div>}

            {step === 'setup' && (
              <Setup topics={topics} topicKey={topicKey} setTopicKey={setTopicKey}
                     minutes={minutes} setMinutes={setMinutes} busy={busy}
                     onStart={() => topicKey && start(topicKey, minutes)} />
            )}

            {step === 'diagnostic' && session && (
              <Diagnostic session={session} answers={answers} setAnswers={setAnswers}
                          busy={busy} onSubmit={submitDiagnostic} />
            )}

            {step === 'results' && results && (
              <Results results={results} topicName={session?.topic_name}
                       onStart={() => setStep('session')} />
            )}

            {step === 'session' && session && (
              <Session sessionId={session.session_id} minutes={minutes}
                       onComplete={() => setStep('complete')} />
            )}

            {step === 'complete' && session && (
              <Complete sessionId={session.session_id} onDone={() => navigate('/forge')} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

/* ---------------- Setup ---------------- */
function Setup({ topics, topicKey, setTopicKey, minutes, setMinutes, busy, onStart }) {
  return (
    <div>
      <div className="sess-kicker">Start a refresh</div>
      <h1 className="sess-skill">What do you want to refresh?</h1>
      <p className="forge-sub" style={{ marginBottom: 8 }}>Pick a topic. A short adaptive diagnostic will find exactly what's faded.</p>

      <div className="setup-grid">
        {topics.map(t => (
          <button key={t.key} className={`setup-topic ${topicKey === t.key ? 'on' : ''}`} onClick={() => setTopicKey(t.key)}>
            <div className="setup-topic-name">{t.name}</div>
            <div className="setup-topic-mastery">
              <span style={{ color: masteryColor(t.mastery) }}>{t.mastery}%</span> memory{t.decayed ? ' · decayed' : ''}
            </div>
          </button>
        ))}
        {topics.length === 0 && <p className="forge-sub">Loading topics…</p>}
      </div>

      <div style={{ margin: '18px 0 6px', fontWeight: 600, fontSize: 14 }}>How long?</div>
      <div className="chip-row">
        {MINUTE_OPTIONS.map(m => (
          <button key={m} className={`chip ${minutes === m ? 'on' : ''}`} onClick={() => setMinutes(m)}>{m} min</button>
        ))}
      </div>

      <div className="sess-actions">
        <button className="btn btn-primary btn-md" disabled={!topicKey || busy} onClick={onStart}>
          {busy ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
          Begin {minutes}-minute refresh
        </button>
      </div>
    </div>
  )
}

/* ---------------- Diagnostic ---------------- */
function Diagnostic({ session, answers, setAnswers, busy, onSubmit }) {
  const answered = session.questions.filter(q => (answers[q.slug] || '').trim()).length
  return (
    <div>
      <div className="sess-kicker">{session.topic_name} · Diagnostic</div>
      <h1 className="sess-skill">Let's see what you remember</h1>
      <p className="sess-progress-line">Answer in your own words — partial reasoning still counts. {answered}/{session.questions.length} answered</p>

      {session.questions.map((q, i) => (
        <div key={q.slug} className="diag-q">
          <div className="diag-q-idx">Question {i + 1} · {q.skill_name}</div>
          <div className="diag-q-prompt">{q.prompt}</div>
          <textarea className="sess-textarea" placeholder="Type what you remember…"
            value={answers[q.slug] || ''}
            onChange={e => setAnswers(a => ({ ...a, [q.slug]: e.target.value }))} />
        </div>
      ))}

      <div className="sess-actions">
        <button className="btn btn-primary btn-md" disabled={busy} onClick={onSubmit}>
          {busy ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
          Analyze my knowledge
        </button>
        <span className="forge-sec-hint">Graded by AI, grounded in a rubric</span>
      </div>
    </div>
  )
}

/* ---------------- Results (classification + plan) ---------------- */
function Results({ results, topicName, onStart }) {
  return (
    <div>
      <div className="sess-kicker">{topicName} · Diagnosis</div>
      <h1 className="sess-skill">Here's what faded</h1>
      <div className="narrative-box">{results.narrative}</div>

      <div className="forge-sec-head"><div className="forge-sec-title">Skill breakdown</div></div>
      {results.classification.map(c => (
        <div key={c.skill_key + c.name} className="class-row">
          <div className="mem-name">{c.name}</div>
          <div className="mem-bar"><i style={{ width: `${c.mastery}%`, background: masteryColor(c.mastery) }} /></div>
          <div className="mem-pct" style={{ color: masteryColor(c.mastery) }}>{c.mastery}%</div>
        </div>
      ))}

      {results.plan?.length > 0 && (
        <>
          <div className="forge-sec-head"><div className="forge-sec-title">Your rebuild plan</div>
            <div className="forge-sec-hint">weakest first</div></div>
          {results.plan.map((p, i) => (
            <div key={p.skill_key} className="done-pill">
              <span><span style={{ color: 'var(--text-3)', marginRight: 8 }}>{i + 1}</span>{p.name}</span>
              <span className="forge-sec-hint">{p.mastery}%</span>
            </div>
          ))}
        </>
      )}

      <div className="sess-actions">
        <button className="btn btn-primary btn-md" onClick={onStart}>
          <Target size={16} /> Start rebuilding
        </button>
      </div>
    </div>
  )
}

/* ---------------- Session (adaptive loop) ---------------- */
function Session({ sessionId, minutes, onComplete }) {
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [response, setResponse] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [count, setCount] = useState(0)

  // Lumi tutor
  const [tutorMsg, setTutorMsg] = useState('')
  const [tutorStage, setTutorStage] = useState('hint')
  const [tutorBusy, setTutorBusy] = useState(false)

  // countdown (display only)
  const [secs, setSecs] = useState(minutes * 60)
  const timerRef = useRef(null)
  useEffect(() => {
    timerRef.current = setInterval(() => setSecs(s => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(timerRef.current)
  }, [])
  const mmss = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`

  async function loadNext() {
    setLoading(true); setError(''); setFeedback(null); setResponse('')
    setTutorMsg(''); setTutorStage('hint')
    try {
      const a = await api.forgeNext(sessionId)
      if (a.done) { onComplete(); return }
      setActivity(a)
    } catch (e) {
      setError(e.message || 'Could not load the next activity')
    } finally { setLoading(false) }
  }
  useEffect(() => { loadNext() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    if (!response.trim()) return
    setBusy(true); setError('')
    try {
      const f = await api.forgeAnswer(activity.activity_id, response)
      setFeedback(f); setCount(c => c + 1)
    } catch (e) {
      setError(e.message || 'Could not grade your answer')
    } finally { setBusy(false) }
  }

  async function askLumi() {
    setTutorBusy(true)
    try {
      const r = await api.forgeTutor({
        question: `I'm working on: "${activity.prompt}". My current thinking: ${response || '(nothing yet)'}`,
        skill_key: activity.skill_key,
        stage: tutorStage,
      })
      setTutorMsg(r.reply)
      setTutorStage(r.next_stage || 'answer')
    } catch {
      setTutorMsg("Lumi is unavailable right now — try reasoning from first principles: what breaks first under failure?")
    } finally { setTutorBusy(false) }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><Spinner size={32} /></div>
  if (error) return <div className="sess-feedback mid">{error}<div style={{ marginTop: 10 }}><button className="btn btn-primary btn-sm" onClick={loadNext}>Retry</button></div></div>
  if (!activity) return null

  const good = feedback && feedback.score >= 70

  return (
    <div>
      <div className="sess-top">
        <div className="sess-kicker">{activity.skill_name} refresh</div>
        <div className="sess-timer"><Clock size={13} style={{ verticalAlign: -2 }} /> {mmss}</div>
      </div>
      <div className="sess-skill">{activity.title || activity.skill_name}</div>
      <div className="sess-progress-line">{count} concept{count === 1 ? '' : 's'} refreshed{activity.source === 'ai' ? ' · AI-generated for you' : ''}</div>

      <div className="sess-card">
        <span className="sess-badge">{activity.kind}</span>
        {activity.concept && <div className="sess-concept">{activity.concept}</div>}
        {activity.example && <div className="sess-example">{activity.example}</div>}
        <div className="sess-prompt">{activity.prompt}</div>

        {!feedback ? (
          <>
            <textarea className="sess-textarea" placeholder="Work through it in your own words…"
              value={response} onChange={e => setResponse(e.target.value)} autoFocus />
            <div className="sess-actions">
              <button className="btn btn-primary btn-md" disabled={busy || !response.trim()} onClick={submit}>
                {busy ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />} Submit answer
              </button>
              <button className="btn btn-ghost btn-sm" disabled={tutorBusy} onClick={askLumi}>
                {tutorBusy ? <Loader2 size={14} className="spin" /> : <Lightbulb size={14} />} Ask Lumi
              </button>
            </div>
            {tutorMsg && <div className="sess-hint-box"><strong>Lumi:</strong> {tutorMsg}</div>}
          </>
        ) : (
          <>
            <div className={`sess-feedback ${good ? 'good' : 'mid'}`}>
              <div className="sess-mastery-move">
                {activity.skill_name}: {feedback.mastery_before}% <span className="arrow">→</span>
                <span style={{ color: masteryColor(feedback.mastery_after) }}>{feedback.mastery_after}%</span>
                {feedback.skill_mastered && <span className="forge-badge-tag" style={{ marginLeft: 8 }}><Trophy size={13} /> recovered</span>}
              </div>
              <p style={{ margin: '10px 0 0', lineHeight: 1.55 }}>{feedback.feedback}</p>
              {feedback.misconception && <p style={{ margin: '8px 0 0', color: 'var(--rose)' }}><strong>Watch out:</strong> {feedback.misconception}</p>}
              {feedback.explanation && <p style={{ margin: '10px 0 0', color: 'var(--text-2)', lineHeight: 1.55 }}>{feedback.explanation}</p>}
            </div>
            <div className="sess-actions">
              <button className="btn btn-primary btn-md" onClick={loadNext}>
                Next <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ---------------- Complete ---------------- */
function Complete({ sessionId, onDone }) {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    api.forgeComplete(sessionId).then(setSummary).catch(e => setError(e.message || 'Could not finish the session'))
  }, [sessionId])

  if (error) return <div className="sess-feedback mid">{error}</div>
  if (!summary) return <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><Spinner size={32} /></div>

  const rec = summary.recommended
  return (
    <div>
      <div className="done-hero">
        <div className="done-check"><CheckCircle2 size={30} /></div>
        <div className="sess-kicker">Refresh complete</div>
        <div className="done-topic-move">
          <span style={{ color: 'var(--text-3)' }}>{summary.topic_before}%</span>
          {' → '}
          <span style={{ color: masteryColor(summary.topic_after) }}>{summary.topic_after}%</span>
        </div>
        <p className="forge-sub" style={{ margin: '0 auto' }}>{summary.topic_name} memory, updated. <strong>+{summary.xp} XP</strong></p>
      </div>

      <div className="done-cols">
        <div className="done-col">
          <h4>Recovered</h4>
          {(summary.recovered || []).length ? summary.recovered.map(r => (
            <div key={r.key} className="done-pill">
              <span>{r.name}</span>
              <span className="recent-delta">{r.before}→<span style={{ color: 'var(--green)' }}>{r.after}</span></span>
            </div>
          )) : <p className="forge-sec-hint">Keep going — nothing crossed the mastery bar yet.</p>}
        </div>
        <div className="done-col">
          <h4>Still weak</h4>
          {(summary.still_weak || []).length ? summary.still_weak.map(r => (
            <div key={r.key} className="done-pill">
              <span>{r.name}</span>
              <span className="mem-pct" style={{ color: masteryColor(r.after) }}>{r.after}%</span>
            </div>
          )) : <p className="forge-sec-hint">All clear.</p>}
        </div>
      </div>

      {rec && (
        <div className="narrative-box">
          <strong>Recommended next:</strong> {rec.name} — {rec.minutes} min{rec.when ? `, ${rec.when}` : ''}.
        </div>
      )}

      <div className="sess-actions">
        {rec && <button className="btn btn-primary btn-md" onClick={() => { window.location.href = `/forge/refresh?topic=${rec.key}&minutes=${rec.minutes}` }}><RefreshCw size={16} /> Refresh {rec.name}</button>}
        <button className="btn btn-ghost btn-md" onClick={onDone}>Back to Forge</button>
      </div>
    </div>
  )
}
