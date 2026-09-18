import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function GoogleSuccess() {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const error = params.get('error')

    if (error || !token) {
      navigate('/login?error=' + (error || 'no_token'))
      return
    }

    loginWithToken(token)
      .then(() => navigate('/start', { replace: true }))
      .catch(() => navigate('/login?error=session', { replace: true }))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
      <div style={{ width: 36, height: 36, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Signing you in…</p>
    </div>
  )
}
