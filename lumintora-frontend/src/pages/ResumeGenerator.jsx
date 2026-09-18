import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import Nav, { Sidebar } from '../components/Nav'
import { Button } from '../components/UI'
import {
  Plus, Trash2, Printer, Wand2, X, FileText,
  ChevronDown, ChevronUp, User, Briefcase, GraduationCap, Zap, FolderOpen,
} from 'lucide-react'
import '../components/UI.css'

// ── tiny helpers ────────────────────────────────────────────────
const newExp  = () => ({ company: '', role: '', location: '', start: '', end: '', current: false, bullets: [''] })
const newEdu  = () => ({ school: '', degree: '', field: '', start: '', end: '', gpa: '' })
const newProj = () => ({ name: '', description: '', tech: '', link: '' })

// ── sub-components ───────────────────────────────────────────────

function FormSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="resume-form-section">
      <button className="resume-form-section-head" onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {Icon && <Icon size={16} style={{ color: 'var(--accent)' }} />}
          <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
        </div>
        {open ? <ChevronUp size={16} style={{ color: 'var(--text-3)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-3)' }} />}
      </button>
      {open && <div className="resume-form-section-body">{children}</div>}
    </div>
  )
}

function Field({ label, children, wide }) {
  return (
    <div className="field" style={wide ? { gridColumn: '1 / -1' } : undefined}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  )
}

function ResumeSectionHeading({ title }) {
  return (
    <div style={{
      fontFamily: 'Georgia, serif', fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.09em',
      borderBottom: '1.5px solid #111', paddingBottom: 3, marginBottom: 8, color: '#000',
    }}>
      {title}
    </div>
  )
}

function ResumeDoc({ info, summary, experiences, education, skills, projects }) {
  const contacts = [info.email, info.phone, info.location, info.linkedin, info.website].filter(Boolean)
  const hasExp  = experiences.some(e => e.company || e.role)
  const hasEdu  = education.some(e => e.school)
  const hasProj = projects.some(p => p.name)

  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#111', fontSize: 11, lineHeight: 1.45 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #111', paddingBottom: 10, marginBottom: 14 }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>
          {info.name || 'Your Name'}
        </div>
        {info.targetRole && (
          <div style={{ fontSize: 12, color: '#444', marginTop: 3, fontStyle: 'italic' }}>{info.targetRole}</div>
        )}
        {contacts.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2px 14px', marginTop: 6, fontSize: 10, color: '#333' }}>
            {contacts.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: 14 }}>
          <ResumeSectionHeading title="Professional Summary" />
          <p style={{ margin: 0, textAlign: 'justify', fontSize: 10.5 }}>{summary}</p>
        </div>
      )}

      {/* Experience */}
      {hasExp && (
        <div style={{ marginBottom: 14 }}>
          <ResumeSectionHeading title="Work Experience" />
          {experiences.filter(e => e.company || e.role).map((exp, i, arr) => {
            const dates = [exp.start, exp.current ? 'Present' : exp.end].filter(Boolean).join(' – ')
            return (
              <div key={i} style={{ marginBottom: i < arr.length - 1 ? 10 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: 11 }}>{exp.company}</strong>
                  <span style={{ fontSize: 10, color: '#555' }}>{dates}</span>
                </div>
                <div style={{ fontStyle: 'italic', fontSize: 10.5, color: '#333', marginBottom: 3 }}>
                  {[exp.role, exp.location].filter(Boolean).join(' · ')}
                </div>
                {exp.bullets.length > 0 && (
                  <ul style={{ margin: '3px 0 0 14px', padding: 0 }}>
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} style={{ fontSize: 10.5, marginBottom: 2 }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Education */}
      {hasEdu && (
        <div style={{ marginBottom: 14 }}>
          <ResumeSectionHeading title="Education" />
          {education.filter(e => e.school).map((ed, i, arr) => {
            const dates = [ed.start, ed.end].filter(Boolean).join(' – ')
            const deg   = [ed.degree, ed.field].filter(Boolean).join(' in ')
            return (
              <div key={i} style={{ marginBottom: i < arr.length - 1 ? 8 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: 11 }}>{ed.school}</strong>
                  <span style={{ fontSize: 10, color: '#555' }}>{dates}</span>
                </div>
                {(deg || ed.gpa) && (
                  <div style={{ fontSize: 10.5, color: '#333' }}>
                    {deg}{ed.gpa ? ` · GPA: ${ed.gpa}` : ''}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <ResumeSectionHeading title="Skills" />
          <p style={{ margin: 0, fontSize: 10.5 }}>{skills.join(' · ')}</p>
        </div>
      )}

      {/* Projects */}
      {hasProj && (
        <div style={{ marginBottom: 0 }}>
          <ResumeSectionHeading title="Projects" />
          {projects.filter(p => p.name).map((pr, i, arr) => (
            <div key={i} style={{ marginBottom: i < arr.length - 1 ? 8 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: 11 }}>{pr.name}</strong>
                {pr.link && <span style={{ fontSize: 10, color: '#555' }}>{pr.link}</span>}
              </div>
              {pr.tech && <div style={{ fontSize: 10, color: '#555', fontStyle: 'italic', marginBottom: 2 }}>{pr.tech}</div>}
              {pr.description && <p style={{ margin: 0, fontSize: 10.5 }}>{pr.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────

export default function ResumeGenerator() {
  const { user } = useAuth()

  const [info, setInfo] = useState({
    name:       user?.name     || '',
    email:      user?.email    || '',
    phone:      user?.phone    || '',
    location:   user?.location || '',
    website:    user?.website  || '',
    linkedin:   user?.linkedin || '',
    targetRole: '',
    objective:  user?.bio      || '',
  })
  const [experiences, setExperiences] = useState([newExp()])
  const [education,   setEducation]   = useState([newEdu()])
  const [skills,      setSkills]      = useState([])
  const [skillInput,  setSkillInput]  = useState('')
  const [projects,    setProjects]    = useState([])
  const [aiResult,    setAiResult]    = useState(null)
  const [generating,  setGenerating]  = useState(false)
  const [error,       setError]       = useState('')

  // ── field helpers ──────────────────────────────────────────────
  const setField = (k) => (e) => setInfo(f => ({ ...f, [k]: e.target.value }))

  // ── experience helpers ─────────────────────────────────────────
  const addExp        = () => setExperiences(e => [...e, newExp()])
  const removeExp     = (i) => setExperiences(e => e.filter((_, x) => x !== i))
  const updateExp     = (i, k, v) => setExperiences(e => e.map((ex, x) => x === i ? { ...ex, [k]: v } : ex))
  const addBullet     = (i) => setExperiences(e => e.map((ex, x) => x === i ? { ...ex, bullets: [...ex.bullets, ''] } : ex))
  const removeBullet  = (i, bi) => setExperiences(e => e.map((ex, x) => x === i ? { ...ex, bullets: ex.bullets.filter((_, b) => b !== bi) } : ex))
  const updateBullet  = (i, bi, v) => setExperiences(e => e.map((ex, x) => x === i ? { ...ex, bullets: ex.bullets.map((b, bx) => bx === bi ? v : b) } : ex))

  // ── education helpers ──────────────────────────────────────────
  const addEdu    = () => setEducation(e => [...e, newEdu()])
  const removeEdu = (i) => setEducation(e => e.filter((_, x) => x !== i))
  const updateEdu = (i, k, v) => setEducation(e => e.map((ed, x) => x === i ? { ...ed, [k]: v } : ed))

  // ── skills helpers ─────────────────────────────────────────────
  const addSkill    = () => { const s = skillInput.trim(); if (s && !skills.includes(s)) { setSkills(sk => [...sk, s]); setSkillInput('') } }
  const removeSkill = (i) => setSkills(sk => sk.filter((_, x) => x !== i))
  const onSkillKey  = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill() } }

  // ── project helpers ────────────────────────────────────────────
  const addProj    = () => setProjects(p => [...p, newProj()])
  const removeProj = (i) => setProjects(p => p.filter((_, x) => x !== i))
  const updateProj = (i, k, v) => setProjects(p => p.map((pr, x) => x === i ? { ...pr, [k]: v } : pr))

  // ── generate ───────────────────────────────────────────────────
  const generate = async () => {
    setError('')
    if (!info.name.trim()) { setError('Please fill in your name.'); return }
    setGenerating(true)
    try {
      const result = await api.generateResume({
        name:        info.name,
        objective:   info.objective,
        target_role: info.targetRole,
        experiences: experiences.map(e => ({ ...e, bullets: e.bullets.filter(b => b.trim()) })),
        education,
        skills,
        projects,
      })
      setAiResult(result)
    } catch (err) {
      setError(err.message || 'Could not generate resume. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  // ── resume data to render (AI-enhanced if available) ──────────
  const displaySummary = aiResult?.summary || info.objective || ''
  const displayExps = experiences.map((exp, i) => ({
    ...exp,
    bullets: aiResult?.experiences?.[i]?.bullets?.length
      ? aiResult.experiences[i].bullets
      : exp.bullets.filter(b => b.trim()),
  }))

  return (
    <div>
      <Nav />
      <div className="layout">
        <Sidebar />
        <main className="main animate-fade">

          {/* ── Page header ───────────────────────────────────── */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-ink)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Career Tools
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 6 }}>
              Resume Generator
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
              Fill in your details, then click <strong>Generate with AI</strong> — the AI will write a polished professional summary and enhance your experience bullets.
            </p>
          </div>

          <div className="resume-builder">

            {/* ── LEFT: form ────────────────────────────────── */}
            <div className="resume-form-col">

              {/* Personal */}
              <FormSection title="Personal Info" icon={User}>
                <div className="resume-grid-2">
                  <Field label="Full Name *">
                    <input className="field-input" value={info.name} onChange={setField('name')} placeholder="Jane Smith" />
                  </Field>
                  <Field label="Email">
                    <input className="field-input" type="email" value={info.email} onChange={setField('email')} placeholder="jane@example.com" />
                  </Field>
                  <Field label="Phone">
                    <input className="field-input" value={info.phone} onChange={setField('phone')} placeholder="+1 555 000 1234" />
                  </Field>
                  <Field label="Location">
                    <input className="field-input" value={info.location} onChange={setField('location')} placeholder="City, State" />
                  </Field>
                  <Field label="Website">
                    <input className="field-input" value={info.website} onChange={setField('website')} placeholder="yoursite.com" />
                  </Field>
                  <Field label="LinkedIn">
                    <input className="field-input" value={info.linkedin} onChange={setField('linkedin')} placeholder="linkedin.com/in/username" />
                  </Field>
                  <Field label="Target Role" wide>
                    <input className="field-input" value={info.targetRole} onChange={setField('targetRole')} placeholder="e.g. Senior Software Engineer, Data Scientist…" />
                  </Field>
                  <Field label="Career Objective / Notes for AI" wide>
                    <textarea
                      className="field-input"
                      rows={3}
                      value={info.objective}
                      onChange={setField('objective')}
                      placeholder="Briefly describe your background and goals — AI will turn this into a professional summary."
                      style={{ resize: 'vertical' }}
                    />
                  </Field>
                </div>
              </FormSection>

              {/* Experience */}
              <FormSection title="Work Experience" icon={Briefcase}>
                {experiences.map((exp, i) => (
                  <div key={i} className="resume-entry-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Experience {i + 1}</span>
                      {experiences.length > 1 && (
                        <button className="btn btn-ghost btn-sm" onClick={() => removeExp(i)} aria-label="Remove" style={{ padding: '4px 8px' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="resume-grid-2" style={{ marginBottom: 12 }}>
                      <Field label="Company">
                        <input className="field-input" value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} placeholder="Acme Corp" />
                      </Field>
                      <Field label="Job Title">
                        <input className="field-input" value={exp.role} onChange={e => updateExp(i, 'role', e.target.value)} placeholder="Software Engineer" />
                      </Field>
                      <Field label="Location">
                        <input className="field-input" value={exp.location} onChange={e => updateExp(i, 'location', e.target.value)} placeholder="San Francisco, CA" />
                      </Field>
                      <div className="resume-grid-2">
                        <Field label="Start">
                          <input className="field-input" value={exp.start} onChange={e => updateExp(i, 'start', e.target.value)} placeholder="Jan 2022" />
                        </Field>
                        <Field label="End">
                          <input className="field-input" value={exp.current ? 'Present' : exp.end} onChange={e => updateExp(i, 'end', e.target.value)} placeholder="Present" disabled={exp.current} />
                        </Field>
                      </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)', marginBottom: 12, cursor: 'pointer' }}>
                      <input type="checkbox" checked={exp.current} onChange={e => updateExp(i, 'current', e.target.checked)} />
                      Current position
                    </label>
                    <div>
                      <div className="field-label" style={{ marginBottom: 8 }}>
                        Bullet points{' '}
                        <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(AI will enhance these)</span>
                      </div>
                      {exp.bullets.map((b, bi) => (
                        <div key={bi} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <input
                            className="field-input"
                            value={b}
                            onChange={e => updateBullet(i, bi, e.target.value)}
                            placeholder="Describe an accomplishment or responsibility…"
                          />
                          {exp.bullets.length > 1 && (
                            <button className="btn btn-ghost btn-sm" onClick={() => removeBullet(i, bi)} aria-label="Remove bullet" style={{ padding: '4px 8px', flexShrink: 0 }}>
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button className="btn btn-ghost btn-sm" onClick={() => addBullet(i)}>
                        <Plus size={14} /> Add bullet
                      </button>
                    </div>
                  </div>
                ))}
                <button className="btn btn-secondary btn-sm" onClick={addExp} style={{ width: '100%' }}>
                  <Plus size={14} /> Add experience
                </button>
              </FormSection>

              {/* Education */}
              <FormSection title="Education" icon={GraduationCap}>
                {education.map((ed, i) => (
                  <div key={i} className="resume-entry-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Education {i + 1}</span>
                      {education.length > 1 && (
                        <button className="btn btn-ghost btn-sm" onClick={() => removeEdu(i)} aria-label="Remove" style={{ padding: '4px 8px' }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="resume-grid-2">
                      <Field label="School">
                        <input className="field-input" value={ed.school} onChange={e => updateEdu(i, 'school', e.target.value)} placeholder="University Name" />
                      </Field>
                      <Field label="Degree">
                        <input className="field-input" value={ed.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} placeholder="B.S." />
                      </Field>
                      <Field label="Field of Study">
                        <input className="field-input" value={ed.field} onChange={e => updateEdu(i, 'field', e.target.value)} placeholder="Computer Science" />
                      </Field>
                      <Field label="GPA (optional)">
                        <input className="field-input" value={ed.gpa} onChange={e => updateEdu(i, 'gpa', e.target.value)} placeholder="3.8" />
                      </Field>
                      <Field label="Start">
                        <input className="field-input" value={ed.start} onChange={e => updateEdu(i, 'start', e.target.value)} placeholder="2018" />
                      </Field>
                      <Field label="End">
                        <input className="field-input" value={ed.end} onChange={e => updateEdu(i, 'end', e.target.value)} placeholder="2022" />
                      </Field>
                    </div>
                  </div>
                ))}
                <button className="btn btn-secondary btn-sm" onClick={addEdu} style={{ width: '100%' }}>
                  <Plus size={14} /> Add education
                </button>
              </FormSection>

              {/* Skills */}
              <FormSection title="Skills" icon={Zap}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: skills.length ? 12 : 0 }}>
                  {skills.map((s, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: 'var(--accent-soft)', color: 'var(--accent-ink)',
                      padding: '5px 12px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                    }}>
                      {s}
                      <button onClick={() => removeSkill(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0, lineHeight: 1 }} aria-label={`Remove ${s}`}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="field-input"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={onSkillKey}
                    placeholder="Type a skill and press Enter or comma…"
                    style={{ flex: 1 }}
                  />
                  <Button variant="secondary" size="sm" icon={Plus} onClick={addSkill} />
                </div>
              </FormSection>

              {/* Projects */}
              <FormSection title="Projects (Optional)" icon={FolderOpen} defaultOpen={false}>
                {projects.map((pr, i) => (
                  <div key={i} className="resume-entry-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Project {i + 1}</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => removeProj(i)} aria-label="Remove" style={{ padding: '4px 8px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="resume-grid-2" style={{ marginBottom: 12 }}>
                      <Field label="Project Name">
                        <input className="field-input" value={pr.name} onChange={e => updateProj(i, 'name', e.target.value)} placeholder="My Awesome App" />
                      </Field>
                      <Field label="Tech Stack">
                        <input className="field-input" value={pr.tech} onChange={e => updateProj(i, 'tech', e.target.value)} placeholder="React, Node.js, PostgreSQL" />
                      </Field>
                    </div>
                    <Field label="Description">
                      <textarea className="field-input" rows={2} value={pr.description} onChange={e => updateProj(i, 'description', e.target.value)} placeholder="What did you build and what problem does it solve?" style={{ resize: 'vertical' }} />
                    </Field>
                    <Field label="Link (optional)">
                      <input className="field-input" value={pr.link} onChange={e => updateProj(i, 'link', e.target.value)} placeholder="github.com/you/project" />
                    </Field>
                  </div>
                ))}
                <button className="btn btn-secondary btn-sm" onClick={addProj} style={{ width: '100%' }}>
                  <Plus size={14} /> Add project
                </button>
              </FormSection>

              {error && (
                <div style={{ color: 'var(--rose)', fontSize: 13, padding: '12px 16px', background: 'var(--rose-soft)', borderRadius: 'var(--radius-sm)' }} role="alert">
                  {error}
                </div>
              )}

              <Button variant="primary" size="lg" icon={Wand2} loading={generating} onClick={generate} style={{ width: '100%' }}>
                {generating ? 'Generating…' : 'Generate with AI'}
              </Button>
            </div>

            {/* ── RIGHT: preview ─────────────────────────────── */}
            <div className="resume-preview-col">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Resume Preview</span>
                {aiResult && (
                  <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
                    Print / Save PDF
                  </Button>
                )}
              </div>

              {!aiResult ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '64px 24px', background: 'var(--bg-1)', border: '1px dashed var(--border-2)',
                  borderRadius: 'var(--radius)', textAlign: 'center', gap: 12,
                }}>
                  <FileText size={38} style={{ color: 'var(--text-3)' }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>Your resume will appear here</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 250, lineHeight: 1.6 }}>
                    Fill in the form on the left and click <strong>Generate with AI</strong>.
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 12, color: 'var(--green)', background: 'var(--green-soft)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                    AI enhanced your summary and bullet points
                  </div>
                  <div className="resume-doc">
                    <ResumeDoc
                      info={info}
                      summary={displaySummary}
                      experiences={displayExps}
                      education={education}
                      skills={skills}
                      projects={projects}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
