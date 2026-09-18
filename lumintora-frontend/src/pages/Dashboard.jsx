import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import Nav from '../components/Nav'
import { Sidebar } from '../components/Nav'
import { StatCard, Progress, Badge, Spinner, Empty, XPBadge } from '../components/UI'
import { Zap, Flame, BookOpen, CheckCircle, Plus, Clock, ArrowRight, Target, Code2, Play, RefreshCw } from 'lucide-react'
import '../components/UI.css'

const levelColors = { beginner: 'success', intermediate: 'warning', advanced: 'danger' }

export default function Dashboard() {
  const { user } = useAuth()
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.listPaths().then(setPaths).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const active = paths.filter(p => p.status !== 'completed')
  const completed = paths.filter(p => p.status === 'completed')

  return (
    <div>
      <Nav />
      <div className="layout">
        <Sidebar />
        <main className="main animate-fade">
          <div className="dash-header">
            <div className="dash-greeting">Good to see you</div>
            <h1 className="dash-title">Welcome back, {user?.name?.split(' ')[0]}</h1>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <StatCard label="Total XP" value={user?.xp || 0} icon={Zap} color="var(--accent)" />
            <StatCard label="Day Streak" value={`${user?.streak || 0} days`} icon={Flame} color="#f87171" />
            <StatCard label="Active Paths" value={active.length} icon={BookOpen} color="var(--accent-2)" />
            <StatCard label="Completed" value={completed.length} icon={CheckCircle} color="var(--accent-3)" />
          </div>

          {/* Forge — adaptive technical refresh */}
          <Link to="/forge" className="dash-practice">
            <div className="dash-practice-icon"><RefreshCw size={22} /></div>
            <div className="dash-practice-body">
              <div className="dash-practice-title">Forge — refresh what you've forgotten</div>
              <div className="dash-practice-desc">A short adaptive diagnostic finds your <strong>knowledge gaps</strong> and rebuilds them with targeted practice.</div>
            </div>
            <span className="dash-practice-cta"><ArrowRight size={14} /> Open Forge</span>
          </Link>

          {/* Hands-on code practice */}
          <Link to="/playground" className="dash-practice">
            <div className="dash-practice-icon"><Code2 size={22} /></div>
            <div className="dash-practice-body">
              <div className="dash-practice-title">Hands-on code practice</div>
              <div className="dash-practice-desc">Write and <strong>actually run</strong> JavaScript in a safe sandbox — learn by doing.</div>
            </div>
            <span className="dash-practice-cta"><Play size={14} /> Open Playground</span>
          </Link>

          {/* Active paths */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Your Learning Paths</h2>
              <Link to="/start" className="btn btn-primary btn-sm">
                <Plus size={14} /> New Path
              </Link>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                <Spinner size={32} />
              </div>
            ) : paths.length === 0 ? (
              <Empty
                icon={Target}
                title="No paths yet"
                description="Generate your first adaptive learning path powered by AI."
                action={
                  <Link to="/start" className="btn btn-primary btn-md">
                    <Plus size={14} /> Create your first path
                  </Link>
                }
              />
            ) : (
              <div className="paths-grid">
                {paths.map(path => (
                  <Link key={path.id} to={`/paths/${path.id}`} className="path-card">
                    <div className="path-card-tag">
                      <Badge color={levelColors[path.level] || 'default'}>{path.level}</Badge>
                    </div>
                    <div className="path-card-title">{path.title}</div>
                    <div className="path-card-desc">{path.description}</div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
                        <span>Progress</span>
                        <span>{path.progress}%</span>
                      </div>
                      <Progress value={path.progress} />
                    </div>

                    <div className="path-card-meta">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <BookOpen size={12} /> {path.completed_modules}/{path.total_modules} modules
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {path.estimated_hours}h
                      </span>
                      <ArrowRight size={14} color="var(--accent)" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
