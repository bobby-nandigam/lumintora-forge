import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useOnline } from '../hooks/useOnline'
import {
  LayoutDashboard, Trophy, LogOut, Plus, Zap, Code2, User, FileText, MessageSquare, RefreshCw
} from 'lucide-react'
import Logo from './Logo'
import './UI.css'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/forge', icon: RefreshCw, label: 'Forge' },
  { to: '/playground', icon: Code2, label: 'Playground' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
]

export default function Nav() {
  const { user, logout } = useAuth()
  const online = useOnline()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="nav">
      <Link to={user ? '/dashboard' : '/'} className="nav-logo">
        <Logo size={28} />
      </Link>

      {user && (
        <div className="nav-links">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${location.pathname === to ? 'active' : ''}`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>
      )}

      <div className="nav-right">
        {user && (
          <>
            <span className="nav-xp">
              <Zap size={13} /> {user.xp} XP
            </span>
            <Link to="/start" className="btn btn-primary btn-sm">
              <Plus size={14} /> New Path
            </Link>
            <Link
              to="/profile"
              className="avatar nav-avatar"
              title={`${user.name}${user.username ? ` (@${user.username})` : ''} — ${online ? 'online' : 'offline'}`}
              style={{
                width: 34, height: 34, fontSize: 14,
                ...(user.avatar_url ? { backgroundImage: `url(${user.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
              }}
            >
              {!user.avatar_url && (user.name?.[0] || 'U').toUpperCase()}
              <span className={`presence-dot ${online ? '' : 'off'}`} aria-hidden="true" />
            </Link>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Sign out" aria-label="Sign out">
              <LogOut size={15} />
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="sidebar">
      <span className="sidebar-section">Learn</span>
      <Link
        to="/dashboard"
        className={`sidebar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
      >
        <LayoutDashboard size={17} /> Dashboard
      </Link>
      <Link
        to="/start"
        className={`sidebar-item ${location.pathname === '/start' ? 'active' : ''}`}
      >
        <Plus size={17} /> New Path
      </Link>
      <Link
        to="/forge"
        className={`sidebar-item ${location.pathname.startsWith('/forge') ? 'active' : ''}`}
      >
        <RefreshCw size={17} /> Forge
      </Link>
      <Link
        to="/playground"
        className={`sidebar-item ${location.pathname === '/playground' ? 'active' : ''}`}
      >
        <Code2 size={17} /> Code Playground
      </Link>

      <span className="sidebar-section">Community</span>
      <Link
        to="/leaderboard"
        className={`sidebar-item ${location.pathname === '/leaderboard' ? 'active' : ''}`}
      >
        <Trophy size={17} /> Leaderboard
      </Link>

      <span className="sidebar-section">Account</span>
      <Link
        to="/profile"
        className={`sidebar-item ${location.pathname === '/profile' ? 'active' : ''}`}
      >
        <User size={17} /> Profile
      </Link>
      <Link
        to="/resume"
        className={`sidebar-item ${location.pathname === '/resume' ? 'active' : ''}`}
      >
        <FileText size={17} /> Resume
      </Link>
      <Link
        to="/feedback"
        className={`sidebar-item ${location.pathname === '/feedback' ? 'active' : ''}`}
      >
        <MessageSquare size={17} /> Feedback
      </Link>
    </div>
  )
}
