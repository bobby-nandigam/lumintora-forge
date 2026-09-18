import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Input, Button } from '../components/UI'
import Logo from '../components/Logo'
import {
  Mail, Lock, User, ArrowRight, ArrowLeft,
  AtSign, CheckCircle2, XCircle, Sparkles, Code2, Trophy, Brain,
} from 'lucide-react'
import '../components/UI.css'
import GoogleIcon from '../components/GoogleIcon'
import { API_BASE } from '../lib/api'

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,30}$/

function usernameStatus(val) {
  if (!val) return null
  if (val.length < 3) return { ok: false, msg: 'At least 3 characters' }
  if (val.length > 30) return { ok: false, msg: 'Max 30 characters' }
  if (!/^[a-zA-Z0-9_-]+$/.test(val)) return { ok: false, msg: 'Only letters, numbers, - and _' }
  return { ok: true, msg: 'Looks good' }
}

const perks = [
  { icon: Sparkles, text: 'AI builds your personalised path from a goal' },
  { icon: Code2,    text: 'Real coding judge with hidden test cases' },
  { icon: Brain,    text: 'Always-on AI tutor wherever you get stuck' },
  { icon: Trophy,   text: 'XP, streaks, and a leaderboard to climb' },
]

export default function Register() {
  const [name, setName]         = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { register } = useAuth()
  const navigate      = useNavigate()

  const uStatus = usernameStatus(username)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!uStatus?.ok) { setError('Please enter a valid username'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(email, name, username, password)
      navigate('/start')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split">

      {/* ── Left panel ── */}
      <div className="auth-panel-left">
        <div className="auth-panel-glow" />
        <div className="auth-panel-glow auth-panel-glow-2" />

        <div className="auth-panel-top">
          <Logo size={26} wordColor="#fff" surface="#12103a" dark="rgba(255,255,255,0.5)" />
        </div>

        <div className="auth-panel-body">
          <div className="auth-panel-eyebrow">Get started — it's free</div>
          <h2 className="auth-panel-h">Build your path.<br />Your way.</h2>
          <p className="auth-panel-sub">
            Tell us your goal. Our AI builds a learning path around where you actually are — not where the textbook assumes.
          </p>

          <div className="auth-panel-feats">
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="auth-panel-feat">
                <span className="auth-panel-feat-ico"><Icon size={14} /></span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-panel-stats">
          <div className="auth-panel-stat"><span>Free</span><label>No credit card</label></div>
          <div className="auth-panel-stat-div" />
          <div className="auth-panel-stat"><span>2 min</span><label>To your first path</label></div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-panel-right">
        <div className="auth-panel-form">
          <Link to="/" className="auth-back" style={{ marginBottom: 32 }}>
            <ArrowLeft size={14} /> Back to home
          </Link>

          <h1 className="auth-form-h">Create account</h1>
          <p className="auth-form-sub">Start your adaptive learning journey — free.</p>

          <form className="auth-form" onSubmit={submit} style={{ marginTop: 28 }}>
            <Input
              label="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              icon={User}
              placeholder="Your name"
              required
            />

            {/* Username */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Username</div>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-3)', display: 'flex', pointerEvents: 'none',
                }}>
                  <AtSign size={15} />
                </span>
                <input
                  className="field-input"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase())}
                  placeholder="your_username"
                  required
                  style={{ paddingLeft: 34 }}
                />
                {uStatus && (
                  <span style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    color: uStatus.ok ? 'var(--accent-3)' : 'var(--accent-danger)',
                    display: 'flex',
                  }}>
                    {uStatus.ok ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                  </span>
                )}
              </div>
              {uStatus && !uStatus.ok && (
                <div style={{ fontSize: 12, color: 'var(--accent-danger)', marginTop: 4 }}>{uStatus.msg}</div>
              )}
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                Letters, numbers, - and _ only · must be unique
              </div>
            </div>

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={Mail}
              placeholder="you@domain.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={Lock}
              placeholder="Min. 6 characters"
              required
            />

            {error && <div className="auth-error">{error}</div>}

            <Button
              type="submit"
              loading={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              Create account <ArrowRight size={15} />
            </Button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button
            type="button"
            className="btn-google"
            onClick={() => { window.location.href = `${API_BASE}/api/v1/auth/google` }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="auth-switch" style={{ marginTop: 20 }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>

    </div>
  )
}
