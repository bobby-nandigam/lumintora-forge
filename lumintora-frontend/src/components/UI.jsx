import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

// Button
export const Button = forwardRef(({ children, variant = 'primary', size = 'md', loading, icon: Icon, className = '', ...props }, ref) => {
  const base = `btn btn-${variant} btn-${size} ${loading ? 'btn-loading' : ''} ${className}`
  return (
    <button ref={ref} className={base} disabled={loading || props.disabled} {...props}>
      {loading ? <Loader2 size={16} className="spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  )
})

// Badge
export const Badge = ({ children, color = 'default' }) => (
  <span className={`badge badge-${color}`}>{children}</span>
)

// Card
export const Card = ({ children, className = '', onClick, glow }) => (
  <div className={`card ${glow ? 'card-glow' : ''} ${onClick ? 'card-clickable' : ''} ${className}`} onClick={onClick}>
    {children}
  </div>
)

// Progress bar
export const Progress = ({ value = 0, color = 'accent' }) => (
  <div className="progress-track">
    <div className="progress-fill" style={{ width: `${Math.min(100, value)}%`, background: color === 'accent' ? 'var(--accent)' : color }} />
  </div>
)

// Input
export const Input = forwardRef(({ label, error, icon: Icon, ...props }, ref) => (
  <div className="field">
    {label && <label className="field-label">{label}</label>}
    <div className="field-input-wrap">
      {Icon && <Icon size={16} className="field-icon" />}
      <input ref={ref} className={`field-input ${Icon ? 'field-input-icon' : ''} ${error ? 'field-input-error' : ''}`} {...props} />
    </div>
    {error && <span className="field-error">{error}</span>}
  </div>
))

// XP pill
export const XPBadge = ({ xp }) => (
  <span className="xp-badge">
    <span className="xp-dot" />
    {xp} XP
  </span>
)

// Stat card
export const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color + '18', color }}>
      <Icon size={18} />
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
)

// Spinner
export const Spinner = ({ size = 24 }) => (
  <div style={{ width: size, height: size, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
)

// Empty state
export const Empty = ({ icon: Icon, title, description, action }) => (
  <div className="empty-state">
    {Icon && <div className="empty-icon"><Icon size={32} /></div>}
    <div className="empty-title">{title}</div>
    {description && <div className="empty-desc">{description}</div>}
    {action}
  </div>
)

// Module type icon color map
export const moduleTypeColor = {
  lesson: '#7c5cff',
  quiz: '#a78bfa',
  project: '#34d399',
  code: '#fbbf24',
}

export const difficultyColor = {
  beginner: '#34d399',
  intermediate: '#fbbf24',
  advanced: '#f87171',
}
