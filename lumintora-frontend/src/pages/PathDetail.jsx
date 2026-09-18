import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import Nav from '../components/Nav'
import { Sidebar } from '../components/Nav'
import { Progress, Badge, Spinner, XPBadge } from '../components/UI'
import PathJourney from '../components/PathJourney'
import {
  BookOpen, Code2, Brain, CheckSquare, Lock, CheckCircle,
  Play, Clock, ChevronRight, ArrowLeft, Trash2, Map, List
} from 'lucide-react'
import '../components/UI.css'

const typeIcon = { lesson: BookOpen, code: Code2, quiz: Brain, project: CheckSquare }
const typeColor = { lesson: '#7c5cff', code: '#fbbf24', quiz: '#a78bfa', project: '#34d399' }
const diffColor = { beginner: 'success', intermediate: 'warning', advanced: 'danger' }

export default function PathDetail() {
  const { pathId } = useParams()
  const navigate = useNavigate()
  const [path, setPath] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('journey')

  useEffect(() => {
    api.getPath(pathId).then(setPath).catch(() => navigate('/dashboard')).finally(() => setLoading(false))
  }, [pathId])

  const handleDelete = async () => {
    if (!confirm('Delete this learning path?')) return
    await api.deletePath(pathId)
    navigate('/dashboard')
  }

  if (loading) return (
    <div><Nav />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size={36} />
      </div>
    </div>
  )
  if (!path) return null

  const modules = path.modules || []

  return (
    <div>
      <Nav />
      <div className="layout">
        <Sidebar />
        <main className="main animate-fade">
          {/* Back */}
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>
            <ArrowLeft size={14} /> Back to dashboard
          </Link>

          {/* Header */}
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32, marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <Badge color={diffColor[path.level] || 'default'}>{path.level}</Badge>
              <Badge color="default">{path.topic}</Badge>
              {path.tags?.map(t => <Badge key={t} color="default">{t}</Badge>)}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{path.title}</h1>
            <p style={{ color: 'var(--text-2)', fontSize: 15, marginBottom: 24 }}>{path.description}</p>

            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
                  <span>{path.completed_modules} of {path.total_modules} modules</span>
                  <span>{path.progress}%</span>
                </div>
                <Progress value={path.progress} />
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-2)', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={13} /> {path.estimated_hours}h estimated
                </span>
              </div>
              <button onClick={handleDelete} className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-danger)' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Modules */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
              {view === 'journey' ? 'Your Journey' : 'Learning Modules'}
            </h2>
            <div className="view-toggle">
              <button className={`view-toggle-btn ${view === 'journey' ? 'active' : ''}`} onClick={() => setView('journey')}>
                <Map size={14} /> Journey
              </button>
              <button className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
                <List size={14} /> List
              </button>
            </div>
          </div>

          {view === 'journey' ? (
            <PathJourney modules={modules} onSelect={(id) => navigate(`/modules/${id}`)} />
          ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {modules.map((mod, i) => {
              const Icon = typeIcon[mod.type] || BookOpen
              const color = typeColor[mod.type] || '#7c5cff'
              const isLocked = mod.status === 'locked'
              const isDone = mod.status === 'completed'
              const isActive = mod.status === 'available' || mod.status === 'in_progress'

              return (
                <div
                  key={mod.id}
                  className={`module-card ${isLocked ? 'locked' : ''} ${isDone ? 'completed' : ''} ${mod.status === 'in_progress' ? 'in_progress' : ''}`}
                  onClick={() => !isLocked && navigate(`/modules/${mod.id}`)}
                >
                  <div className="module-icon" style={{ background: color + '18', color }}>
                    {isDone ? <CheckCircle size={20} color="var(--accent-3)" /> : isLocked ? <Lock size={18} color="var(--text-3)" /> : <Icon size={20} />}
                  </div>

                  <div className="module-info">
                    <div className="module-title">{mod.title}</div>
                    <div className="module-meta">
                      <Badge color={mod.type === 'lesson' ? 'accent' : mod.type === 'quiz' ? 'purple' : mod.type === 'code' ? 'warning' : 'success'}>
                        {mod.type}
                      </Badge>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> {mod.duration_minutes}m
                      </span>
                      <XPBadge xp={mod.xp_reward} />
                    </div>
                  </div>

                  {!isLocked && (
                    <ChevronRight size={16} color="var(--text-3)" />
                  )}
                </div>
              )
            })}
          </div>
          )}
        </main>
      </div>
    </div>
  )
}
