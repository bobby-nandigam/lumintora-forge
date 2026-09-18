import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { THEMES, saveTheme, getSavedThemeId, getTheme } from '../lib/themes'
import Nav, { Sidebar } from '../components/Nav'
import GeneratingExperience from '../components/GeneratingExperience'
import {
  Sprout, Zap, Rocket, ArrowRight, ArrowLeft, Check,
  Coffee, Timer, Flame, Briefcase, Lightbulb, Hammer, GraduationCap, BookOpen,
  Map, Wand2, Code2, Bot, Trophy,
} from 'lucide-react'
import '../components/UI.css'

const INTERESTS = [
  'Full-stack web development', 'Machine learning with Python', 'System design',
  'Data structures & algorithms', 'Cloud & DevOps', 'Mobile apps',
  'UI/UX design', 'Cybersecurity', 'Game development',
]

const LEVELS = [
  { id: 'beginner', icon: Sprout, label: 'Beginner', desc: 'Just starting out' },
  { id: 'intermediate', icon: Zap, label: 'Intermediate', desc: 'Know the basics' },
  { id: 'advanced', icon: Rocket, label: 'Advanced', desc: 'Going deep' },
]

const PACES = [
  { id: 'casual', icon: Coffee, label: 'Casual', desc: '~10 min / day' },
  { id: 'regular', icon: Timer, label: 'Regular', desc: '~30 min / day' },
  { id: 'intense', icon: Flame, label: 'Intense', desc: '1 hr+ / day' },
]

const MOTIVATIONS = [
  { id: 'career', icon: Briefcase, label: 'Land a job / promotion' },
  { id: 'curiosity', icon: Lightbulb, label: 'Curiosity & fun' },
  { id: 'project', icon: Hammer, label: 'Build a project' },
  { id: 'exam', icon: GraduationCap, label: 'Ace an interview / exam' },
]

const STEPS = ['Interest', 'Level', 'Pace', 'Generate']

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [interest, setInterest] = useState('')
  const [theme, setTheme] = useState(getSavedThemeId())
  const [level, setLevel] = useState('beginner')
  const [pace, setPace] = useState('regular')
  const [motivation, setMotivation] = useState('career')
  const [error, setError] = useState('')
  const [genError, setGenError] = useState('')
  const [existingPaths, setExistingPaths] = useState([])

  useEffect(() => {
    api.listPaths().then(p => setExistingPaths(p || [])).catch(() => {})
  }, [])

  const pickTheme = (id) => { setTheme(id); saveTheme(id) }

  const next = () => {
    if (step === 0 && !interest.trim()) { setError('Tell us what you want to learn'); return }
    setError('')
    if (step === STEPS.length - 2) { generate(); return }
    setStep(s => s + 1)
  }
  const back = () => { setError(''); setStep(s => Math.max(0, s - 1)) }

  const generate = async () => {
    setGenError('')
    setStep(STEPS.length - 1)
    const paceLabel = PACES.find(p => p.id === pace)?.desc || ''
    const motivationLabel = MOTIVATIONS.find(m => m.id === motivation)?.label || ''
    const goal =
      `${interest.trim()}. ` +
      `I can study ${paceLabel}. My motivation is to ${motivationLabel.toLowerCase()}. ` +
      `Keep modules short and motivating with clear milestones.`
    try {
      // Fast 8B model keeps generation snappy (~8s) for the onboarding flow.
      const path = await api.generatePath({
        goal,
        level,
        topic: interest.trim(),
        model: '@cf/meta/llama-3.1-8b-instruct-fast',
      })
      navigate(`/paths/${path.id}`)
    } catch (err) {
      setGenError(err.message || 'AI service was busy. Please try again.')
    }
  }

  const isGenerating = step === STEPS.length - 1

  const activeTheme = getTheme(theme)

  return (
    <div>
      <Nav />
      <div className="layout">
        <Sidebar />
        <main className="main onb-main">
          <div className="onb-grid">
            <div className="onb-left">
        {!isGenerating && (
          <div className="onb-progress">
            {STEPS.slice(0, -1).map((label, i) => (
              <div key={label} className={`onb-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                <span className="onb-dot-mark">{i < step ? <Check size={12} /> : i + 1}</span>
                <span className="onb-dot-label">{label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="onb-card animate-fade" key={step}>
          {/* ── Step 0: Interest ── */}
          {step === 0 && (
            <>
              <div className="onb-kicker">Let's get started</div>
              <h1 className="onb-h1">What do you want to master?</h1>
              <p className="onb-sub">Pick a starting point — we'll shape a path around it.</p>
              <textarea
                className="onb-textarea"
                value={interest}
                onChange={e => setInterest(e.target.value)}
                placeholder="e.g. Learn React to build production web apps"
                rows={3}
                autoFocus
              />
              <div className="onb-chips">
                {INTERESTS.map(s => (
                  <button
                    key={s}
                    className={`onb-chip ${interest === s ? 'selected' : ''}`}
                    onClick={() => setInterest(s)}
                  >{s}</button>
                ))}
              </div>
            </>
          )}

          {/* ── Step 1: Level ── */}
          {step === 1 && (
            <>
              <div className="onb-kicker">Calibrate</div>
              <h1 className="onb-h1">Where are you right now?</h1>
              <p className="onb-sub">So we set the difficulty just right — never too easy, never overwhelming.</p>
              <div className="onb-options">
                {LEVELS.map(l => (
                  <button key={l.id} className={`onb-option ${level === l.id ? 'selected' : ''}`} onClick={() => setLevel(l.id)}>
                    <l.icon size={26} className="onb-option-icon" />
                    <span className="onb-option-label">{l.label}</span>
                    <span className="onb-option-desc">{l.desc}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Step 2: Pace + Motivation ── */}
          {step === 2 && (
            <>
              <div className="onb-kicker">Almost there</div>
              <h1 className="onb-h1">How do you like to learn?</h1>
              <p className="onb-sub">A quick survey so your path fits your life.</p>

              <div className="onb-q-label">Your pace</div>
              <div className="onb-options">
                {PACES.map(p => (
                  <button key={p.id} className={`onb-option ${pace === p.id ? 'selected' : ''}`} onClick={() => setPace(p.id)}>
                    <p.icon size={24} className="onb-option-icon" />
                    <span className="onb-option-label">{p.label}</span>
                    <span className="onb-option-desc">{p.desc}</span>
                  </button>
                ))}
              </div>

              <div className="onb-q-label" style={{ marginTop: 22 }}>What's driving you?</div>
              <div className="onb-motiv">
                {MOTIVATIONS.map(m => (
                  <button key={m.id} className={`onb-motiv-item ${motivation === m.id ? 'selected' : ''}`} onClick={() => setMotivation(m.id)}>
                    <m.icon size={16} />
                    {m.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Step 4: Generating ── */}
          {isGenerating && (
            <GeneratingExperience
              interest={interest.trim()}
              error={genError}
              onRetry={generate}
            />
          )}

          {error && <div className="onb-error">{error}</div>}

          {!isGenerating && (
            <div className="onb-actions">
              {step > 0
                ? <button className="btn btn-ghost btn-md" onClick={back}><ArrowLeft size={15} /> Back</button>
                : <span />}
              <button className="btn btn-primary btn-lg" onClick={next}>
                {step === STEPS.length - 2
                  ? <>Generate my path <ArrowRight size={16} /></>
                  : <>Continue <ArrowRight size={16} /></>}
              </button>
            </div>
          )}
        </div>
            </div>

            {/* ── Right-hand panel — keeps the page full & gives context ── */}
            <aside className="onb-side">
              <div className="onb-side-card onb-side-hero">
                <div
                  className="onb-side-emoji"
                  style={{ background: `linear-gradient(135deg, ${activeTheme.gradFrom}, ${activeTheme.gradTo})` }}
                >{activeTheme.emoji}</div>
                <h3 className="onb-side-title">Your adaptive journey</h3>
                <p className="onb-side-text">In about a minute, Lumintora builds a learning path made just for you — then keeps reshaping it as you grow.</p>
                <ul className="onb-side-feats">
                  <li><span><Map size={15} /></span> A visual, gamified learning path</li>
                  <li><span><Wand2 size={15} /></span> Difficulty that adapts as you go</li>
                  <li><span><Code2 size={15} /></span> Hands-on code you actually run</li>
                  <li><span><Bot size={15} /></span> Lumi — your in-browser AI tutor</li>
                  <li><span><Trophy size={15} /></span> XP, streaks &amp; the leaderboard</li>
                </ul>
              </div>

              {existingPaths.length > 0 && (
                <div className="onb-side-card">
                  <div className="onb-existing-head">
                    <span>Continue where you left off</span>
                    <Link to="/dashboard" className="onb-existing-all">All <ArrowRight size={12} /></Link>
                  </div>
                  <div className="onb-existing-list">
                    {existingPaths.slice(0, 4).map(p => (
                      <Link key={p.id} to={`/paths/${p.id}`} className="onb-existing-item">
                        <span className="onb-existing-icon"><BookOpen size={14} /></span>
                        <span className="onb-existing-info">
                          <span className="onb-existing-title">{p.title}</span>
                          <span className="onb-existing-meta">{p.progress}% · {p.completed_modules}/{p.total_modules} modules</span>
                        </span>
                        <ArrowRight size={14} color="var(--text-3)" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
