import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import Logo from '../components/Logo'
import SiteFooter from '../components/SiteFooter'
import { CheckCircle, XCircle } from 'lucide-react'
import '../components/UI.css'

export default function Verify() {
  const [params] = useSearchParams()
  const certId = params.get('cert')
  const [status, setStatus] = useState('loading')
  const [cert, setCert] = useState(null)

  useEffect(() => {
    if (!certId) { setStatus('invalid'); return }
    api.verifyCertificate(certId)
      .then(data => { setCert(data); setStatus('valid') })
      .catch(() => setStatus('invalid'))
  }, [certId])

  const issueDate = cert?.issued_at
    ? new Date(cert.issued_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <header style={{ padding: '20px clamp(20px,5vw,56px)', borderBottom: '1px solid var(--border)' }}>
        <Link to="/"><Logo size={24} fontSize={15} /></Link>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        {status === 'loading' && (
          <div style={{ textAlign: 'center', color: 'var(--text-2)' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 15 }}>Verifying certificate…</p>
          </div>
        )}

        {status === 'valid' && cert && (
          <div style={{ maxWidth: 480, width: '100%', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '40px 36px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={32} color="#16a34a" />
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              Verified Certificate
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
              {cert.user_name}
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 15, marginBottom: 20 }}>
              successfully completed
            </p>
            <div style={{ background: 'var(--accent-soft)', borderRadius: 'var(--radius)', padding: '14px 20px', marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent-ink)' }}>{cert.path_title}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--text-2)', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <span>Issued {issueDate}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, background: 'var(--bg-2)', padding: '3px 8px', borderRadius: 4 }}>{cert.cert_id}</span>
            </div>
          </div>
        )}

        {status === 'invalid' && (
          <div style={{ maxWidth: 480, width: '100%', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '40px 36px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <XCircle size={32} color="#dc2626" />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
              Certificate not found
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 15, marginBottom: 28 }}>
              {certId
                ? `No certificate with ID "${certId}" exists in our system.`
                : 'No certificate ID was provided.'}
            </p>
            <Link to="/" className="btn btn-primary">Go to Lumintora</Link>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
