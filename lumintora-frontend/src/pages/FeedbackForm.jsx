import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import Nav, { Sidebar } from '../components/Nav'
import { Button } from '../components/UI'
import {
  MessageSquare, User, Mail, Building2, BookOpen, Tag,
  AlertCircle, CheckCircle2, ChevronDown, Send,
} from 'lucide-react'
import '../components/UI.css'

const CATEGORIES = [
  { value: 'bug', label: 'Bug report', desc: 'Something is broken or not working' },
  { value: 'feature', label: 'Feature request', desc: 'Something I wish the app could do' },
  { value: 'content', label: 'Content issue', desc: 'Wrong, outdated, or missing lesson content' },
  { value: 'path', label: 'Learning path issue', desc: 'Path structure, module order, or AI output' },
  { value: 'ux', label: 'UI / UX feedback', desc: 'Design, navigation, or accessibility' },
  { value: 'general', label: 'General feedback', desc: 'Anything else on your mind' },
]

const YEARS = ['1st year', '2nd year', '3rd year', '4th year', 'Final year', 'Alumni', 'Other']
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical']

function Select({ label, icon: Icon, value, onChange, options, placeholder, required }) {
  return (
    <div className="field">
      <label className="field-label">{label}{required && <span className="field-req"> *</span>}</label>
      <div className="field-input-wrap" style={{ position: 'relative' }}>
        {Icon && <Icon size={15} className="field-icon" />}
        <select
          className={`field-input ${Icon ? 'field-input-icon' : ''}`}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          style={{ appearance: 'none', paddingRight: 32 }}
        >
          <option value="">{placeholder}</option>
          {options.map(o => (
            <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
              {typeof o === 'string' ? o : o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }} />
      </div>
    </div>
  )
}

export default function FeedbackForm() {
  const { user } = useAuth()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    college: '',
    branch: '',
    year: '',
    category: '',
    subject: '',
    description: '',
    severity: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: typeof v === 'string' ? v : v.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.category) { setError('Please select a category.'); return }
    setSubmitting(true)
    try {
      await api.submitFeedback(form)
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Could not submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div>
        <Nav />
        <div className="layout">
          <Sidebar />
          <main className="main animate-fade">
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: 400, gap: 16, textAlign: 'center',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle2 size={32} color="var(--accent-3)" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>Thank you!</h2>
              <p style={{ color: 'var(--text-2)', fontSize: 15, maxWidth: 380, lineHeight: 1.6 }}>
                Your feedback has been received. We read every submission and use it to improve Lumintora.
              </p>
              <button className="btn btn-secondary btn-md" onClick={() => {
                setSubmitted(false)
                setForm({ name: user?.name || '', email: user?.email || '', college: '', branch: '', year: '', category: '', subject: '', description: '', severity: '' })
              }}>
                Submit another
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const isBug = form.category === 'bug'

  return (
    <div>
      <Nav />
      <div className="layout">
        <Sidebar />
        <main className="main animate-fade">

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-ink)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Support
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Share feedback
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14, maxWidth: 560 }}>
              Report a bug, request a feature, or share anything you'd like us to know.
              Every submission is read by the team.
            </p>
          </div>

          <form onSubmit={submit} style={{ maxWidth: 680 }}>

            {/* Who are you */}
            <div className="card" style={{ padding: '24px 28px', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={16} color="var(--accent-ink)" /> About you
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="field">
                  <label className="field-label">Name <span className="field-req">*</span></label>
                  <div className="field-input-wrap">
                    <User size={15} className="field-icon" />
                    <input className="field-input field-input-icon" value={form.name} onChange={set('name')} placeholder="Your name" required />
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Email <span className="field-req">*</span></label>
                  <div className="field-input-wrap">
                    <Mail size={15} className="field-icon" />
                    <input className="field-input field-input-icon" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">College / University</label>
                  <div className="field-input-wrap">
                    <Building2 size={15} className="field-icon" />
                    <input className="field-input field-input-icon" value={form.college} onChange={set('college')} placeholder="e.g. IIT Bombay, BITS Pilani…" />
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Branch / Department</label>
                  <div className="field-input-wrap">
                    <BookOpen size={15} className="field-icon" />
                    <input className="field-input field-input-icon" value={form.branch} onChange={set('branch')} placeholder="e.g. CSE, ECE, Data Science…" />
                  </div>
                </div>
                <Select label="Year of study" icon={Tag} value={form.year} onChange={set('year')} options={YEARS} placeholder="Select year" />
              </div>
            </div>

            {/* The issue */}
            <div className="card" style={{ padding: '24px 28px', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={16} color="var(--accent-ink)" /> Your feedback
              </div>

              {/* Category cards */}
              <div className="field" style={{ marginBottom: 16 }}>
                <label className="field-label">Category <span className="field-req">*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10, marginTop: 6 }}>
                  {CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => set('category')(c.value)}
                      style={{
                        textAlign: 'left', padding: '12px 14px', borderRadius: 'var(--radius)',
                        border: `1.5px solid ${form.category === c.value ? 'var(--accent)' : 'var(--border)'}`,
                        background: form.category === c.value ? 'var(--accent-soft)' : 'var(--bg-1)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13, color: form.category === c.value ? 'var(--accent-ink)' : 'var(--text-1)', marginBottom: 3 }}>
                        {c.label}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.4 }}>{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {isBug && (
                <Select
                  label="Severity"
                  icon={AlertCircle}
                  value={form.severity}
                  onChange={set('severity')}
                  options={SEVERITIES}
                  placeholder="How bad is it?"
                />
              )}

              <div className="field">
                <label className="field-label">Subject <span className="field-req">*</span></label>
                <input
                  className="field-input"
                  value={form.subject}
                  onChange={set('subject')}
                  placeholder="One line summary of your feedback"
                  required
                  maxLength={200}
                />
              </div>

              <div className="field">
                <label className="field-label">Description <span className="field-req">*</span></label>
                <textarea
                  className="field-input"
                  rows={6}
                  value={form.description}
                  onChange={set('description')}
                  placeholder={
                    isBug
                      ? 'What happened? What did you expect? Steps to reproduce…'
                      : 'Describe your feedback in as much detail as you like…'
                  }
                  required
                  style={{ resize: 'vertical' }}
                />
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                  {form.description.length} characters
                </div>
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 13, color: 'var(--accent-danger)', background: 'rgba(248,113,113,0.08)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <Button type="submit" loading={submitting} style={{ gap: 8 }}>
              <Send size={15} /> Submit feedback
            </Button>
          </form>
        </main>
      </div>
    </div>
  )
}
