import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import Nav from '../components/Nav'
import { Button, Badge, Spinner, XPBadge, Progress } from '../components/UI'
import LessonContent from '../components/LessonContent'
import CodeRunner from '../components/CodeRunner'
import ReadAloud from '../components/ReadAloud'
import {
  BookOpen, Code2, Brain, CheckSquare, ArrowLeft, ArrowRight,
  Sparkles, Check, X, Clock, Zap, Play, RotateCcw, CheckCircle2,
  HelpCircle, PartyPopper, BookMarked, Smile, Meh, Frown, Wand2, TrendingUp, TrendingDown, Lock
} from 'lucide-react'
import '../components/UI.css'

const typeIcon = { lesson: BookOpen, code: Code2, quiz: Brain, project: CheckSquare }
const typeColor = { lesson: '#7140ff', code: '#c2790a', quiz: '#8b6bff', project: '#0f9d6b' }
const badgeColor = { lesson: 'accent', quiz: 'purple', code: 'warning', project: 'success' }

/* ── Minimal Markdown renderer (inline bold + `code`, headings, bullets, code blocks) ── */
function renderInline(text, key) {
  // split on **bold** and `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={`${key}-${i}`}>{p.slice(2, -2)}</strong>
    if (p.startsWith('`') && p.endsWith('`')) return <code key={`${key}-${i}`}>{p.slice(1, -1)}</code>
    return <span key={`${key}-${i}`}>{p}</span>
  })
}

function Article({ text }) {
  if (!text) return null
  const lines = text.replace(/\r/g, '').split('\n')
  const out = []
  let i = 0
  let key = 0
  while (i < lines.length) {
    const line = lines[i]
    // fenced code block
    if (line.trim().startsWith('```')) {
      const buf = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) { buf.push(lines[i]); i++ }
      i++ // skip closing fence
      out.push(<pre key={key++}><code>{buf.join('\n')}</code></pre>)
      continue
    }
    if (line.startsWith('### ')) { out.push(<h3 key={key++}>{renderInline(line.slice(4), key)}</h3>); i++; continue }
    if (line.startsWith('## ')) { out.push(<h2 key={key++}>{renderInline(line.slice(3), key)}</h2>); i++; continue }
    if (line.startsWith('# ')) { out.push(<h1 key={key++}>{renderInline(line.slice(2), key)}</h1>); i++; continue }
    if (/^\s*[-*]\s+/.test(line)) {
      out.push(
        <div className="li" key={key++}>
          <span className="li-dot" />
          <span>{renderInline(line.replace(/^\s*[-*]\s+/, ''), key)}</span>
        </div>
      )
      i++; continue
    }
    if (line.trim() === '') { i++; continue }
    out.push(<p key={key++}>{renderInline(line, key)}</p>)
    i++
  }
  return <div className="article">{out}</div>
}

function ContentSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', fontSize: 13, marginBottom: 6 }}>
        <Sparkles size={14} color="var(--accent)" /> Writing your lesson…
      </div>
      {[92, 100, 84, 0, 70, 96, 88, 60].map((w, i) => (
        w === 0
          ? <div key={i} style={{ height: 6 }} />
          : <div key={i} className="sk" style={{ width: `${w}%` }} />
      ))}
    </div>
  )
}

function LessonView({ module, onComplete, completing }) {
  const [content, setContent] = useState(module.content || '')
  const [loadingContent, setLoadingContent] = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const [concept, setConcept] = useState('')
  const [explanation, setExplanation] = useState('')
  const [explaining, setExplaining] = useState(false)

  useEffect(() => {
    let active = true
    const existing = module.content || ''
    if (existing.trim().length >= 400) { setContent(existing); return }
    setLoadingContent(true)
    api.getContent(module.id)
      .then(res => { if (active) setContent(res.content || existing) })
      .catch(() => { if (active) setContent(existing) })
      .finally(() => { if (active) setLoadingContent(false) })
    return () => { active = false }
  }, [module.id])

  const getExplanation = async () => {
    if (!concept.trim()) return
    setExplaining(true)
    try {
      const res = await api.explain({ concept, context: module.title })
      setExplanation(res.explanation)
    } catch { setExplanation('Could not fetch an explanation right now.') }
    setExplaining(false)
  }

  return (
    <div>
      {!loadingContent && (
        <div className="lesson-toolbar">
          <ReadAloud text={content || module.description} />
        </div>
      )}
      <div className="course-content-card">
        {loadingContent ? <ContentSkeleton /> : <LessonContent text={content || module.description} />}
      </div>

      {/* AI assist — quiet, collapsible aside (not a chat) */}
      <div className="assist">
        {!askOpen ? (
          <button
            onClick={() => setAskOpen(true)}
            className="assist-row"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, color: 'var(--text)' }}
          >
            <HelpCircle size={18} color="var(--accent)" />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Stuck on a concept? Get a quick explanation</span>
            <ArrowRight size={15} color="var(--text-3)" style={{ marginLeft: 'auto' }} />
          </button>
        ) : (
          <div>
            <div className="assist-row" style={{ marginBottom: 12 }}>
              <Sparkles size={16} color="var(--accent)" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Explain a concept</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                autoFocus
                value={concept}
                onChange={e => setConcept(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && getExplanation()}
                placeholder="e.g. closures, useEffect, normalization…"
                className="field-input"
                style={{ flex: 1 }}
              />
              <Button onClick={getExplanation} loading={explaining} size="md">Explain</Button>
            </div>
            {explanation && <div className="ai-response">{explanation}</div>}
          </div>
        )}
      </div>

      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onComplete} loading={completing} disabled={loadingContent} size="lg">
          Mark complete <Check size={16} />
        </Button>
      </div>
    </div>
  )
}

function CodeView({ module, onComplete, completing }) {
  const [content, setContent] = useState(module.content || '')
  const [loadingContent, setLoadingContent] = useState(false)

  useEffect(() => {
    let active = true
    const existing = module.content || ''
    if (existing.trim().length >= 400) { setContent(existing); return }
    setLoadingContent(true)
    api.getContent(module.id)
      .then(res => { if (active) setContent(res.content || existing) })
      .catch(() => { if (active) setContent(existing) })
      .finally(() => { if (active) setLoadingContent(false) })
    return () => { active = false }
  }, [module.id])

  return (
    <div>
      {!loadingContent && (
        <div className="lesson-toolbar">
          <ReadAloud text={content || module.description} />
        </div>
      )}
      <div className="course-content-card">
        {loadingContent ? <ContentSkeleton /> : <LessonContent text={content || module.description} />}
      </div>

      <CodeRunner problem={module.title} initialLanguage="javascript" />

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onComplete} loading={completing} disabled={loadingContent} size="lg">
          Submit & complete <Check size={16} />
        </Button>
      </div>
    </div>
  )
}

function QuizView({ module, onComplete, completing }) {
  const [questions, setQuestions] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    let active = true
    setQuestions(null); setLoadError('')
    api.getQuiz(module.id)
      .then(qs => { if (active) setQuestions(qs || []) })
      .catch(() => { if (active) setLoadError('Could not generate this quiz. Please try again.') })
    return () => { active = false }
  }, [module.id])

  const select = (qIdx, optIdx) => { if (!submitted) setAnswers(prev => ({ ...prev, [qIdx]: optIdx })) }

  const submit = async () => {
    if (Object.keys(answers).length < questions.length) { alert('Please answer all questions'); return }
    const answerArr = questions.map((_, i) => answers[i] ?? -1)
    try {
      const res = await api.submitQuiz(module.id, answerArr)
      setResult(res); setSubmitted(true)
    } catch { setLoadError('Could not submit your answers. Please try again.') }
  }

  const reset = () => { setAnswers({}); setSubmitted(false); setResult(null) }

  if (!questions && !loadError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: 56 }}>
        <Spinner size={30} />
        <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Generating your quiz…</div>
      </div>
    )
  }
  if (loadError && !questions) return <div className="ai-panel" style={{ color: 'var(--text-2)', fontSize: 14 }}>{loadError}</div>
  if (questions && questions.length === 0) return <div className="ai-panel" style={{ color: 'var(--text-2)', fontSize: 14 }}>No quiz available for this module.</div>

  const correctOptions = result?.correct_options || []

  return (
    <div>
      {result && (
        <div style={{
          background: result.passed ? 'var(--green-soft)' : 'var(--rose-soft)',
          border: `1px solid ${result.passed ? 'rgba(15,157,107,0.3)' : 'rgba(229,72,77,0.3)'}`,
          borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 24, textAlign: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            {result.passed ? <PartyPopper size={36} color="var(--green)" /> : <BookMarked size={36} color="var(--rose)" />}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600 }}>
            {result.score}/{result.total} correct · {result.percent}%
          </div>
          <div style={{ color: 'var(--text-2)', fontSize: 14, margin: '6px 0 20px' }}>
            {result.passed ? 'Great work — you passed.' : 'Review the material and try again.'}
          </div>
          {result.passed ? (
            <Button onClick={onComplete} loading={completing} size="lg">Claim XP <Zap size={16} /></Button>
          ) : (
            <Button onClick={reset} variant="secondary" size="md"><RotateCcw size={14} /> Retry</Button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {questions.map((q, qi) => (
          <div key={q.id} className="quiz-card">
            <div className="quiz-question">
              <span className="quiz-q-num">Q{qi + 1}</span>{q.question}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi
                const correct = submitted && oi === correctOptions[qi]
                const wrong = submitted && selected && oi !== correctOptions[qi]
                return (
                  <div
                    key={oi}
                    onClick={() => select(qi, oi)}
                    style={{
                      padding: '13px 16px',
                      border: `1.5px solid ${correct ? 'rgba(15,157,107,0.5)' : wrong ? 'rgba(229,72,77,0.5)' : selected ? 'var(--accent)' : 'var(--border-2)'}`,
                      borderRadius: 'var(--radius-sm)',
                      background: correct ? 'var(--green-soft)' : wrong ? 'var(--rose-soft)' : selected ? 'var(--accent-soft)' : 'var(--bg-1)',
                      cursor: submitted ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: 12, fontSize: 14.5,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${correct ? 'var(--green)' : wrong ? 'var(--rose)' : selected ? 'var(--accent)' : 'var(--border-2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {correct && <Check size={11} color="var(--green)" />}
                      {wrong && <X size={11} color="var(--rose)" />}
                    </div>
                    {opt}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted && (
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={submit} size="lg">Submit quiz <ArrowRight size={16} /></Button>
        </div>
      )}
    </div>
  )
}

export default function ModulePage() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const [module, setModule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)
  const [feedbackChoice, setFeedbackChoice] = useState('')
  const [adapting, setAdapting] = useState(false)
  const [adaptResult, setAdaptResult] = useState(null)
  const [pathData, setPathData] = useState(null)   // the parent path + its module list

  useEffect(() => {
    api.getModule(moduleId)
      .then(m => {
        setModule(m)
        api.startModule(moduleId).catch(() => {})
        api.getPath(m.path_id).then(setPathData).catch(() => {})
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
    // reset post-completion state when navigating between modules
    setCompleted(false); setFeedbackChoice(''); setAdaptResult(null); setAdapting(false)
    window.scrollTo(0, 0)
  }, [moduleId])

  const handleComplete = async () => {
    setCompleting(true)
    try {
      const res = await api.completeModule(moduleId)
      setXpEarned(res?.xp_earned || module?.xp_reward || 10)
      setCompleted(true)
      // refresh the outline so the next module unlocks in the sidebar
      if (module?.path_id) api.getPath(module.path_id).then(setPathData).catch(() => {})
    } catch { setCompleted(true) }
    setCompleting(false)
  }

  // The learner's self-rated difficulty drives path adaptation.
  const sendFeedback = async (choice) => {
    setFeedbackChoice(choice)
    setAdapting(true)
    try {
      await api.moduleFeedback(moduleId, choice)
      const res = await api.adaptPath(module.path_id, moduleId)
      setAdaptResult(res)
    } catch { setAdaptResult({ adapted: false }) }
    setAdapting(false)
  }

  if (loading) return (
    <div><Nav />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spinner size={36} /></div>
    </div>
  )
  if (!module) return null

  const Icon = typeIcon[module.type] || BookOpen
  const color = typeColor[module.type] || '#7140ff'

  const siblings = pathData?.modules || []
  const curIdx = siblings.findIndex(s => s.id === moduleId)
  const navigable = (m) => m && ['available', 'in_progress', 'completed'].includes(m.status)
  const prevMod = curIdx > 0 ? siblings[curIdx - 1] : null
  const nextMod = curIdx >= 0 && curIdx < siblings.length - 1 ? siblings[curIdx + 1] : null

  return (
    <div>
      <Nav />
      <div className="course-layout">
        {/* ── Course outline sidebar ── */}
        <aside className="course-aside">
          <Link to={`/paths/${module.path_id}`} className="course-back">
            <ArrowLeft size={14} /> Back to path
          </Link>
          {pathData && (
            <>
              <div className="course-aside-title">{pathData.title}</div>
              <div className="course-aside-progress">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-2)', marginBottom: 5 }}>
                  <span>{pathData.completed_modules}/{pathData.total_modules} done</span>
                  <span>{pathData.progress}%</span>
                </div>
                <Progress value={pathData.progress} />
              </div>
              <nav className="course-modlist">
                {siblings.map((m, i) => {
                  const MI = typeIcon[m.type] || BookOpen
                  const isCur = m.id === moduleId
                  const isDone = m.status === 'completed'
                  const isLocked = m.status === 'locked'
                  return (
                    <button
                      key={m.id}
                      className={`course-mod ${isCur ? 'current' : ''} ${isDone ? 'done' : ''} ${isLocked ? 'locked' : ''}`}
                      disabled={isLocked}
                      onClick={() => !isLocked && !isCur && navigate(`/modules/${m.id}`)}
                    >
                      <span className="course-mod-icon">
                        {isDone ? <Check size={13} /> : isLocked ? <Lock size={12} /> : <MI size={13} />}
                      </span>
                      <span className="course-mod-title">{m.title}</span>
                      <span className="course-mod-num">{i + 1}</span>
                    </button>
                  )
                })}
              </nav>
            </>
          )}
        </aside>

        {/* ── Lesson content ── */}
        <main className="course-main">
        {/* Mobile-only path bar — the sidebar is hidden below 900px */}
        {pathData && (
          <div className="course-mobile-bar">
            <Link to={`/paths/${module.path_id}`} className="course-back">
              <ArrowLeft size={14} /> Back to path
            </Link>
            <div className="course-mobile-progress">
              <div className="course-mobile-progress-meta">
                <span className="course-mobile-progress-title">{pathData.title}</span>
                <span>{pathData.completed_modules}/{pathData.total_modules} · {pathData.progress}%</span>
              </div>
              <Progress value={pathData.progress} />
            </div>
          </div>
        )}
        <div className="course-module-hero">
          <div className="course-module-meta">
            <div className="course-module-type-icon" style={{ background: color + '18', color }}>
              <Icon size={19} />
            </div>
            <Badge color={badgeColor[module.type] || 'accent'}>{module.type}</Badge>
            <span className="course-module-chip"><Clock size={13} /> {module.duration_minutes}m</span>
            <XPBadge xp={module.xp_reward} />
          </div>
          <h1 className="course-module-title">{module.title}</h1>
          <p className="course-module-desc">{module.description}</p>
        </div>

        {completed && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ background: 'var(--green-soft)', border: '1px solid rgba(15,157,107,0.3)', borderRadius: 'var(--radius)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <CheckCircle2 size={26} color="var(--green)" />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--green)' }}>Module completed</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>You earned +{xpEarned} XP. Keep going!</div>
              </div>
              <Link to={`/paths/${module.path_id}`} className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
                Back to path <ArrowRight size={13} />
              </Link>
            </div>

            {/* Adaptive learning: ask how it felt, then reshape the path. */}
            {!feedbackChoice && (
              <div className="adapt-feedback">
                <div className="adapt-feedback-q"><Wand2 size={15} color="var(--accent)" /> How did that feel? We'll adapt what comes next.</div>
                <div className="adapt-feedback-opts">
                  <button className="adapt-fb-btn" onClick={() => sendFeedback('easy')}><Smile size={16} /> Too easy</button>
                  <button className="adapt-fb-btn" onClick={() => sendFeedback('good')}><Meh size={16} /> Just right</button>
                  <button className="adapt-fb-btn" onClick={() => sendFeedback('hard')}><Frown size={16} /> Too hard</button>
                </div>
              </div>
            )}

            {adapting && (
              <div className="adapt-result adapt-result-working">
                <Spinner size={18} /> <span>Re-tuning your path to match…</span>
              </div>
            )}

            {!adapting && adaptResult && (
              adaptResult.adapted ? (
                <div className={`adapt-result ${adaptResult.direction === 'advance' ? 'adapt-up' : 'adapt-down'}`}>
                  <div className="adapt-result-icon">
                    {adaptResult.direction === 'advance' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="adapt-result-title">
                      {adaptResult.direction === 'advance' ? 'Leveling you up' : 'Added some support'}
                      <span className="adapt-badge"><Wand2 size={11} /> Adaptive</span>
                    </div>
                    <div className="adapt-result-sub">
                      New module: <strong>{adaptResult.module?.title}</strong>
                      {adaptResult.reason ? ` — ${adaptResult.reason}` : ''}
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/modules/${adaptResult.module.id}`)}>
                    Start it <ArrowRight size={13} />
                  </button>
                </div>
              ) : (
                <div className="adapt-result adapt-ontrack">
                  <Check size={18} color="var(--green)" />
                  <span>You're right on track — no changes needed. Onward!</span>
                </div>
              )
            )}
          </div>
        )}

        {!completed && (
          <>
            {module.type === 'lesson' && <LessonView module={module} onComplete={handleComplete} completing={completing} />}
            {module.type === 'code' && <CodeView module={module} onComplete={handleComplete} completing={completing} />}
            {module.type === 'quiz' && <QuizView module={module} onComplete={handleComplete} completing={completing} />}
            {module.type === 'project' && <LessonView module={module} onComplete={handleComplete} completing={completing} />}
          </>
        )}

        {/* Prev / next within the path */}
        <div className="course-nav">
          {prevMod ? (
            <button className="course-nav-btn" disabled={!navigable(prevMod)} onClick={() => navigable(prevMod) && navigate(`/modules/${prevMod.id}`)}>
              <ArrowLeft size={15} />
              <span><span className="course-nav-label">Previous</span><span className="course-nav-name">{prevMod.title}</span></span>
            </button>
          ) : <span />}
          {nextMod ? (
            <button
              className="course-nav-btn course-nav-next"
              disabled={!navigable(nextMod)}
              title={!navigable(nextMod) ? 'Complete this module to unlock the next' : ''}
              onClick={() => navigable(nextMod) && navigate(`/modules/${nextMod.id}`)}
            >
              <span><span className="course-nav-label">Next{!navigable(nextMod) ? ' · locked' : ''}</span><span className="course-nav-name">{nextMod.title}</span></span>
              {navigable(nextMod) ? <ArrowRight size={15} /> : <Lock size={13} />}
            </button>
          ) : (
            <Link to={`/paths/${module.path_id}`} className="course-nav-btn course-nav-next">
              <span><span className="course-nav-label">Finish</span><span className="course-nav-name">Back to path</span></span>
              <ArrowRight size={15} />
            </Link>
          )}
        </div>
        </main>
      </div>
    </div>
  )
}
