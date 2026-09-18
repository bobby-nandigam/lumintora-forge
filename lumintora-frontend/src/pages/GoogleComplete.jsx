import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import Logo from '../components/Logo'
import { ArrowRight, AtSign, CheckCircle2, XCircle } from 'lucide-react'
import '../components/UI.css'

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,30}$/

function usernameStatus(val) {
  if (!val) return null
  if (val.length < 3) return { ok: false, msg: 'At least 3 characters' }
  if (val.length > 30) return { ok: false, msg: 'Max 30 characters' }
  if (!USERNAME_RE.test(val)) return { ok: false, msg: 'Letters, numbers, - and _ only' }
  return { ok: true, msg: 'Looks good' }
}

export default function GoogleComplete() {
  const params    = new URLSearchParams(window.location.search)
  const pending   = params.get('pending') || ''
  const prefName  = params.get('name') || ''
  const prefEmail = params.get('email') || ''

  const [username, setUsername] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { loginWithToken }      = useAuth()
  const navigate                = useNavigate()

  const uStatus = usernameStatus(username)

  const submit = async (e) => {
    e.preventDefault()
    if (!uStatus?.ok) return
    setError('')
    setLoading(true)
    try {
      const { token } = await api.googleComplete({ pending_token: pending, username })
      await loginWithToken(token)
      navigate('/start', { replace: true })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link to="/" style={{ display: 'inline-flex', marginBottom: 40 }}>
          <Logo size={26} />
        </Link>

        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>
          One last step
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 28, lineHeight: 1.5 }}>
          Welcome, <strong>{prefName || prefEmail}</strong>! Pick a username to complete your account.
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Username */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Username</div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', display: 'flex', pointerEvents: 'none' }}>
                <AtSign size={15} />
              </span>
              <input
                className="field-input"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase())}
                placeholder="your_username"
                required
                autoFocus
                style={{ paddingLeft: 34 }}
              />
              {uStatus && (
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: uStatus.ok ? 'var(--accent-3)' : 'var(--accent-danger)', display: 'flex' }}>
                  {uStatus.ok ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                </span>
              )}
            </div>
            {uStatus && !uStatus.ok && (
              <div style={{ fontSize: 12, color: 'var(--accent-danger)', marginTop: 4 }}>{uStatus.msg}</div>
            )}
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
              Letters, numbers, - and _ · must be unique
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading || !uStatus?.ok}
          >
            {loading ? 'Creating account…' : <>Finish & start learning <ArrowRight size={15} /></>}
          </button>
        </form>
      </div>
    </div>
  )
}
