import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import Nav from '../components/Nav'
import { Button, Input } from '../components/UI'
import { Sprout, Zap, Rocket, ArrowRight, Sparkles } from 'lucide-react'
import '../components/UI.css'

const levels = [
  { id: 'beginner', icon: Sprout, label: 'Beginner', desc: 'Just starting out' },
  { id: 'intermediate', icon: Zap, label: 'Intermediate', desc: 'Know the basics' },
  { id: 'advanced', icon: Rocket, label: 'Advanced', desc: 'Going deep' },
]

const suggestions = [
  'Full-stack web development with React and Node',
  'Machine learning fundamentals with Python',
  'System design for backend engineers',
  'Data structures and algorithms for interviews',
  'DevOps and cloud infrastructure with AWS',
  'Mobile app development with React Native',
]

export default function NewPath() {
  const [goal, setGoal] = useState('')
  const [level, setLevel] = useState('beginner')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const generate = async () => {
    if (!goal.trim()) { setError('Please describe your learning goal'); return }
    setError('')
    setLoading(true)
    try {
      const path = await api.generatePath({ goal: goal.trim(), level, topic: goal.trim() })
      navigate(`/paths/${path.id}`)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <Nav />
      <div style={{ minHeight: '100vh', paddingTop: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <div className="new-path-page animate-fade" style={{ width: '100%' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Sparkles size={18} color="var(--accent)" />
            <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI-powered</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
            What do you want to learn?
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 16, marginBottom: 40 }}>
            Tell us your goal and we'll build a personalized learning path — instantly.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Your goal</div>
              <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="e.g. Learn React to build production web apps"
                rows={3}
                style={{
                  width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', color: 'var(--text)', padding: '14px 16px',
                  fontSize: 15, outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Quick suggestions */}
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>Or pick a suggestion:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => setGoal(s)}
                    style={{
                      padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 100,
                      background: 'transparent', color: 'var(--text-2)', fontSize: 12, cursor: 'pointer',
                      transition: 'all 0.2s', fontFamily: 'var(--font-body)',
                    }}
                    onMouseEnter={e => { e.target.style.borderColor = 'var(--border-accent)'; e.target.style.color = 'var(--text)' }}
                    onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-2)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10 }}>Your level</div>
              <div className="level-options">
                {levels.map(l => (
                  <div
                    key={l.id}
                    className={`level-option ${level === l.id ? 'selected' : ''}`}
                    onClick={() => setLevel(l.id)}
                  >
                    <div className="level-option-icon"><l.icon size={24} /></div>
                    <div className="level-option-label">{l.label}</div>
                    <div className="level-option-desc">{l.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 13, color: 'var(--accent-danger)', background: 'rgba(248,113,113,0.08)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                {error}
              </div>
            )}

            <Button
              onClick={generate}
              loading={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
              size="lg"
            >
              {loading ? 'Building your path...' : <>Generate my path <ArrowRight size={16} /></>}
            </Button>

            {loading && (
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>
                AI is crafting a personalized path for you. This takes ~15 seconds.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
