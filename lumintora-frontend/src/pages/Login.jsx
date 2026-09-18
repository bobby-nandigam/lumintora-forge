import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Input, Button } from '../components/UI'
import Logo from '../components/Logo'
import {
  Mail, Lock, ArrowRight, ArrowLeft,
  CheckCircle2, Flame, Zap, Bot, Route,
} from 'lucide-react'
import '../components/UI.css'
import GoogleIcon from '../components/GoogleIcon'
import { API_BASE } from '../lib/api'

const features = [
  { icon: Route,        text: 'Pick up exactly where you left off' },
  { icon: Bot,          text: 'AI tutor available wherever you are' },
  { icon: Zap,          text: 'XP and streak tracked automatically' },
  { icon: Flame,        text: 'Adaptive path reshapes as you grow' },
]

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
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
          <div className="auth-panel-eyebrow">Welcome back</div>
          <h2 className="auth-panel-h">Your path<br />is waiting.</h2>
          <p className="auth-panel-sub">
            Every lesson, quiz, and XP point is saved. Jump back in right where you stopped.
          </p>

          <div className="auth-panel-feats">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="auth-panel-feat">
                <span className="auth-panel-feat-ico"><Icon size={14} /></span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-panel-stats">
          <div className="auth-panel-stat"><span>Free</span><label>No card needed</label></div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-panel-right">
        <div className="auth-panel-form">
          <Link to="/" className="auth-back" style={{ marginBottom: 32 }}>
            <ArrowLeft size={14} /> Back to home
          </Link>

          <h1 className="auth-form-h">Sign in</h1>
          <p className="auth-form-sub">Enter your credentials to continue.</p>

          <form className="auth-form" onSubmit={submit} style={{ marginTop: 28 }}>
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
              placeholder="••••••••"
              required
            />
            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--text-2)', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent-ink)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-2)'}
              >Forgot password?</Link>
            </div>
            {error && (
              <div className="auth-error">{error}</div>
            )}
            <Button
              type="submit"
              loading={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              Sign in <ArrowRight size={15} />
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
            Don't have an account? <Link to="/register">Create one free</Link>
          </div>
        </div>
      </div>

    </div>
  )
}
