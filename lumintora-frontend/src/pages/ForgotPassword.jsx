import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { Input, Button } from '../components/UI'
import Logo from '../components/Logo'
import { Mail, Lock, KeyRound, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import '../components/UI.css'

export default function ForgotPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  // step: 'request' (enter email) | 'reset' (enter code + new password) | 'done'
  const [step, setStep] = useState('request')
  const [email, setEmail] = useState(params.get('email') || '')
  const [code, setCode] = useState(params.get('code') || '')
  const [password, setPassword] = useState('')
  const [devCode, setDevCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Deep link from the reset email: /reset-password?email=&code= → jump to reset.
  useEffect(() => {
    if (params.get('code')) setStep('reset')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function requestCode(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const r = await api.forgotPassword(email)
      if (r.dev_code) setDevCode(r.dev_code) // local/dev: no SMTP configured
      setStep('reset')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  async function reset(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await api.resetPassword({ email, code, password })
      setStep('done')
    } catch (err) {
      setError(err.message || 'Could not reset password')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-panel-right" style={{ minHeight: '100vh' }}>
      <div className="auth-panel-form">
        <Link to="/login" className="auth-back" style={{ marginBottom: 32 }}>
          <ArrowLeft size={14} /> Back to sign in
        </Link>
        <div style={{ marginBottom: 20 }}><Logo size={24} /></div>

        {step === 'request' && (
          <>
            <h1 className="auth-form-h">Forgot password?</h1>
            <p className="auth-form-sub">Enter your email and we'll send a reset code.</p>
            <form className="auth-form" onSubmit={requestCode} style={{ marginTop: 28 }}>
              <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                icon={Mail} placeholder="you@domain.com" required />
              {error && <div className="auth-error">{error}</div>}
              <Button type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                Send reset code <ArrowRight size={15} />
              </Button>
            </form>
          </>
        )}

        {step === 'reset' && (
          <>
            <h1 className="auth-form-h">Enter your code</h1>
            <p className="auth-form-sub">We sent a 6-digit code to <strong>{email}</strong>. It expires in 30 minutes.</p>
            {devCode && (
              <div className="auth-error" style={{ background: 'var(--amber-soft)', color: 'var(--amber)', borderColor: 'transparent' }}>
                Dev mode (no email server): your code is <strong>{devCode}</strong>
              </div>
            )}
            <form className="auth-form" onSubmit={reset} style={{ marginTop: 20 }}>
              <Input label="Reset code" value={code} onChange={e => setCode(e.target.value)}
                icon={KeyRound} placeholder="123456" inputMode="numeric" required />
              <Input label="New password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                icon={Lock} placeholder="At least 6 characters" required />
              {error && <div className="auth-error">{error}</div>}
              <Button type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                Reset password <ArrowRight size={15} />
              </Button>
            </form>
            <div className="auth-switch" style={{ marginTop: 20 }}>
              Didn't get it? <button className="link-btn" onClick={() => setStep('request')} style={{ background: 'none', border: 'none', color: 'var(--accent-ink)', cursor: 'pointer', padding: 0, font: 'inherit' }}>Try again</button>
            </div>
          </>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green-soft)', color: 'var(--green)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={30} />
            </div>
            <h1 className="auth-form-h">Password updated</h1>
            <p className="auth-form-sub">You can now sign in with your new password.</p>
            <Button onClick={() => navigate('/login')} style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}>
              Go to sign in <ArrowRight size={15} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
