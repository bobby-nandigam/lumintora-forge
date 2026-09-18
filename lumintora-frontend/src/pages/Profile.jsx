import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useOnline } from '../hooks/useOnline'
import { api } from '../lib/api'
import Nav, { Sidebar } from '../components/Nav'
import StreakHeatmap from '../components/StreakHeatmap'
import Logo from '../components/Logo'
import { Button, StatCard, Spinner } from '../components/UI'
import {
  Zap, Flame, Trophy, CalendarDays, Mail, Phone, Globe, MapPin,
  Twitter, Github, Linkedin, Pencil, X, Check, Calendar, Link2, AtSign, Share2,
  Award, Download, ExternalLink,
} from 'lucide-react'
import '../components/UI.css'
import QRCode from 'qrcode'

// Turn stored handles/values into real, clickable URLs.
const linkFor = {
  website: (v) => (/^https?:\/\//i.test(v) ? v : `https://${v}`),
  twitter: (v) => `https://x.com/${v.replace(/^@/, '')}`,
  github: (v) => `https://github.com/${v.replace(/^@/, '')}`,
  linkedin: (v) => (/^https?:\/\//i.test(v) ? v : `https://www.linkedin.com/in/${v.replace(/^@/, '')}`),
}

const SOCIALS = [
  { key: 'twitter', icon: Twitter, label: 'X (Twitter)', placeholder: 'username', prefix: '@' },
  { key: 'github', icon: Github, label: 'GitHub', placeholder: 'username', prefix: '@' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', placeholder: 'in/username or full URL' },
]

function joinedLabel(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d)) return null
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const online = useOnline()
  const [activity, setActivity] = useState(null)
  const [loadingAct, setLoadingAct] = useState(true)
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [completedPaths, setCompletedPaths] = useState([])
  const [certPath, setCertPath] = useState(null)

  const handleShare = () => {
    const handle = user.username ? `@${user.username}` : user.name
    const text = `${handle} on Lumintora\nhttps://www.lumintora.in`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  useEffect(() => {
    api.activity().then(setActivity).catch(() => setActivity(null)).finally(() => setLoadingAct(false))
    api.listPaths()
      .then(paths => setCompletedPaths((paths || []).filter(p => p.progress === 100 || (p.total_modules > 0 && p.completed_modules === p.total_modules))))
      .catch(() => {})
  }, [])

  if (!user) return null

  const initial = (user.name?.[0] || 'U').toUpperCase()
  const joined = joinedLabel(user.created_at)

  const contacts = [
    user.email && { icon: Mail, label: user.email, href: `mailto:${user.email}` },
    user.phone && { icon: Phone, label: user.phone, href: `tel:${user.phone}` },
    user.location && { icon: MapPin, label: user.location },
    user.website && { icon: Globe, label: user.website.replace(/^https?:\/\//, ''), href: linkFor.website(user.website) },
  ].filter(Boolean)

  const socialLinks = SOCIALS
    .filter((s) => user[s.key])
    .map((s) => ({ ...s, href: linkFor[s.key](user[s.key]), value: user[s.key] }))

  return (
    <div>
      <Nav />
      <div className="layout">
        <Sidebar />
        <main className="main animate-fade">
          {/* ── Header ───────────────────────────────────────────── */}
          <section className="profile-hero">
            <div className="profile-hero-banner" />
            <div className="profile-hero-body">
              <div
                className="avatar profile-avatar"
                style={user.avatar_url ? { backgroundImage: `url(${user.avatar_url})` } : undefined}
                title={online ? 'Online' : 'Offline'}
              >
                {!user.avatar_url && initial}
                <span className={`presence-dot presence-dot-lg ${online ? '' : 'off'}`} aria-hidden="true" />
              </div>

              <div className="profile-hero-main">
                <div className="profile-hero-top">
                  <div>
                    <h1 className="profile-name">{user.name}</h1>
                    {user.username && (
                      <div style={{ fontSize: 15, color: 'var(--accent-ink)', fontWeight: 600, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AtSign size={14} />{user.username}
                      </div>
                    )}
                    {joined && (
                      <div className="profile-joined">
                        <Calendar size={13} /> Joined {joined}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Button variant="ghost" size="sm" icon={copied ? Check : Share2} onClick={handleShare}
                      style={{ color: copied ? 'var(--accent-ink)' : undefined }}>
                      {copied ? 'Copied!' : 'Share'}
                    </Button>
                    <Button variant="secondary" size="sm" icon={Pencil} onClick={() => setEditing(true)}>
                      Edit details
                    </Button>
                  </div>
                </div>

                {user.bio && <p className="profile-bio">{user.bio}</p>}

                <div className="profile-contacts">
                  {contacts.map((c, i) => {
                    const Inner = (
                      <>
                        <c.icon size={14} /> {c.label}
                      </>
                    )
                    return c.href ? (
                      <a key={i} className="profile-contact" href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                        {Inner}
                      </a>
                    ) : (
                      <span key={i} className="profile-contact">{Inner}</span>
                    )
                  })}
                </div>

                {socialLinks.length > 0 && (
                  <div className="profile-socials">
                    {socialLinks.map((s) => (
                      <a key={s.key} className="profile-social" href={s.href} target="_blank" rel="noreferrer" title={s.label}>
                        <s.icon size={16} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Stats ────────────────────────────────────────────── */}
          <div className="stats-grid" style={{ marginTop: 24 }}>
            <StatCard label="Total XP" value={user.xp || 0} icon={Zap} color="var(--accent)" />
            <StatCard label="Current Streak" value={`${activity?.current_streak ?? user.streak ?? 0} days`} icon={Flame} color="#f87171" />
            <StatCard label="Longest Streak" value={`${activity?.longest_streak ?? 0} days`} icon={Trophy} color="#fbbf24" />
            <StatCard label="Active Days" value={activity?.total_active_days ?? 0} icon={CalendarDays} color="var(--accent-2)" />
          </div>

          {/* ── Heatmap ──────────────────────────────────────────── */}
          <section className="card profile-heatmap-card">
            <div className="profile-section-head">
              <div>
                <h2 className="profile-section-title">Learning activity</h2>
                <p className="profile-section-sub">
                  {activity?.total_contributions ?? 0} contributions in the last year
                </p>
              </div>
            </div>
            {loadingAct ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <Spinner size={28} />
              </div>
            ) : (
              <StreakHeatmap days={activity?.days || []} />
            )}
          </section>

          {/* ── Achievements ─────────────────────────────────────── */}
          {completedPaths.length > 0 && (
            <section className="card" style={{ marginTop: 24 }}>
              <div className="profile-section-head">
                <div>
                  <h2 className="profile-section-title">Achievements</h2>
                  <p className="profile-section-sub">
                    {completedPaths.length} course{completedPaths.length !== 1 ? 's' : ''} completed
                  </p>
                </div>
              </div>
              <div className="cert-badges">
                {completedPaths.map(path => (
                  <div key={path.id} className="cert-badge-card">
                    <div className="cert-badge-icon"><Award size={20} /></div>
                    <div className="cert-badge-info">
                      <div className="cert-badge-title">{path.title}</div>
                      <div className="cert-badge-meta">{path.topic} · {path.level}</div>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setCertPath(path)}>
                      View certificate
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {editing && (
        <EditProfileModal
          user={user}
          onClose={() => setEditing(false)}
          onSaved={async () => {
            await refreshUser()
            setEditing(false)
          }}
        />
      )}

      {certPath && (
        <CertificateModal path={certPath} user={user} onClose={() => setCertPath(null)} />
      )}
    </div>
  )
}

/* ── Certificate modal ───────────────────────────────────────── */

function CertificateModal({ path, user, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [cert, setCert] = useState(null)
  const [certError, setCertError] = useState(false)

  // Issue (or retrieve) the certificate from the backend on open
  useEffect(() => {
    api.issueCertificate(path.id)
      .then(data => setCert(data))
      .catch(() => setCertError(true))
  }, [path.id])

  const certId = cert?.cert_id || ''
  const issued = cert?.issued_at ? new Date(cert.issued_at) : new Date()
  const issueDate = issued.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const issueYear = issued.getFullYear()
  const issueMonth = issued.getMonth() + 1
  const verifyUrl = certId ? `https://lumintora.in/verify?cert=${certId}` : ''

  useEffect(() => {
    if (!verifyUrl) return
    QRCode.toDataURL(verifyUrl, { width: 96, margin: 1, color: { dark: '#1e1b4b', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => {})
  }, [verifyUrl])

  const linkedInUrl = certId ? [
    'https://www.linkedin.com/profile/add',
    '?startTask=CERTIFICATION_NAME',
    `&name=${encodeURIComponent(path.title)}`,
    `&organizationId=`,
    `&issueYear=${issueYear}`,
    `&issueMonth=${issueMonth}`,
    `&certUrl=${encodeURIComponent(verifyUrl)}`,
    `&certId=${encodeURIComponent(certId)}`,
  ].join('') : '#'

  const handlePrint = () => window.print()

  return (
    <div className="modal-overlay cert-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="cert-modal-wrap">
        {/* Action bar — hidden on print */}
        <div className="cert-actions no-print">
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={15} /> Close</button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary btn-sm" onClick={handlePrint} disabled={!cert}>
              <Download size={14} /> Download / Print
            </button>
            <a href={linkedInUrl} target="_blank" rel="noreferrer"
               className="btn btn-primary btn-sm"
               style={!cert ? { pointerEvents: 'none', opacity: 0.5 } : {}}>
              <Linkedin size={14} /> Add to LinkedIn
            </a>
          </div>
        </div>

        {/* Loading state */}
        {!cert && !certError && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
            <Spinner size={32} />
          </div>
        )}

        {/* Error state */}
        {certError && (
          <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-2)', fontSize: 15 }}>
            Could not issue certificate. Make sure the course is fully completed.
          </div>
        )}

        {/* The certificate paper */}
        {cert && (
          <div className="cert-paper" id="certificate">
            <div className="cert-corner cert-corner-tl" />
            <div className="cert-corner cert-corner-tr" />
            <div className="cert-corner cert-corner-bl" />
            <div className="cert-corner cert-corner-br" />

            <div className="cert-logo-row">
              <Logo size={26} fontSize={17} wordColor="#1e1b4b" surface="transparent" />
            </div>

            <div className="cert-ribbon">Certificate of Completion</div>

            <div className="cert-congrats">Congratulations!</div>

            <div className="cert-name">{user.name}</div>

            <div className="cert-body-text">has successfully completed the course</div>

            <div className="cert-course-title">{path.title}</div>

            <div className="cert-course-meta">{path.topic} &nbsp;·&nbsp; {path.level}</div>

            <div className="cert-divider" />

            <div className="cert-footer-row">
              <div className="cert-footer-col">
                <div className="cert-footer-label">Issued on</div>
                <div className="cert-footer-value">{issueDate}</div>
                <div className="cert-footer-label" style={{ marginTop: 8 }}>Certificate ID</div>
                <div className="cert-footer-value cert-id-text">{certId}</div>
              </div>
              <div className="cert-seal-wrap">
                <div className="cert-seal"><Award size={26} /></div>
                <div className="cert-seal-label">Lumintora</div>
              </div>
              <div className="cert-footer-col cert-footer-right">
                {qrDataUrl && (
                  <>
                    <img src={qrDataUrl} alt="Verify certificate" className="cert-qr" />
                    <div className="cert-footer-label" style={{ marginTop: 6, textAlign: 'center' }}>Scan to verify</div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Edit modal ──────────────────────────────────────────────── */

const FIELDS = [
  { key: 'name', label: 'Display name', icon: null, placeholder: 'Your name', required: true },
  { key: 'username', label: 'Username', icon: AtSign, placeholder: 'your_username', hint: 'Letters, numbers, - and _ only' },
  { key: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'you@example.com', required: true },
  { key: 'phone', label: 'Phone number', icon: Phone, type: 'tel', placeholder: '+1 555 000 1234' },
  { key: 'location', label: 'Location', icon: MapPin, placeholder: 'City, Country' },
  { key: 'website', label: 'Website', icon: Globe, placeholder: 'yoursite.com' },
  { key: 'avatar_url', label: 'Avatar image URL', icon: Link2, placeholder: 'https://…/photo.jpg' },
]

function EditProfileModal({ user, onClose, onSaved }) {
  const dialogRef = useRef(null)
  const [form, setForm] = useState(() => {
    const f = { name: '', username: '', email: '', phone: '', location: '', website: '', avatar_url: '', bio: '', twitter: '', github: '', linkedin: '' }
    for (const k of Object.keys(f)) f[k] = user[k] || ''
    return f
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Display name is required.')
    if (!form.email.trim() || !form.email.includes('@')) return setError('A valid email is required.')
    setSaving(true)
    try {
      await api.updateMe(form)
      await onSaved()
    } catch (err) {
      setError(err.message || 'Could not save changes.')
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal profile-modal" ref={dialogRef} role="dialog" aria-modal="true" aria-label="Edit profile">
        <div className="modal-head">
          <h2 className="modal-title">Edit profile</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <form className="modal-body profile-form" onSubmit={submit}>
          {FIELDS.map((fld) => (
            <div className="field" key={fld.key}>
              <label className="field-label">{fld.label}{fld.required && <span className="field-req"> *</span>}</label>
              <div className="field-input-wrap">
                {fld.icon && <fld.icon size={16} className="field-icon" />}
                <input
                  className={`field-input ${fld.icon ? 'field-input-icon' : ''}`}
                  type={fld.type || 'text'}
                  value={form[fld.key]}
                  onChange={e => set(fld.key)(e)}
                  placeholder={fld.placeholder}
                />
              </div>
              {fld.hint && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>{fld.hint}</div>}
            </div>
          ))}

          <div className="field profile-form-wide">
            <label className="field-label">Bio</label>
            <textarea
              className="field-input profile-textarea"
              rows={3}
              maxLength={280}
              value={form.bio}
              onChange={set('bio')}
              placeholder="A short line about what you're learning…"
            />
            <span className="field-hint">{form.bio.length}/280</span>
          </div>

          <div className="profile-form-wide profile-form-socials">
            <div className="field-label" style={{ marginBottom: 4 }}>Social profiles</div>
            <div className="profile-social-grid">
              {SOCIALS.map((s) => (
                <div className="field" key={s.key}>
                  <div className="field-input-wrap">
                    <s.icon size={16} className="field-icon" />
                    <input
                      className="field-input field-input-icon"
                      value={form[s.key]}
                      onChange={set(s.key)}
                      placeholder={s.placeholder}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="profile-form-wide field-error" role="alert">{error}</div>}

          <div className="profile-form-wide modal-actions">
            <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" size="md" icon={Check} loading={saving}>Save changes</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
