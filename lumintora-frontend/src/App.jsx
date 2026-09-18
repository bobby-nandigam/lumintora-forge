import { useLayoutEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { applyTheme, getSavedThemeId, DEFAULT_THEME } from './lib/themes'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import PathDetail from './pages/PathDetail'
import ModulePage from './pages/ModulePage'
import Leaderboard from './pages/Leaderboard'
import NewPath from './pages/NewPath'
import Onboarding from './pages/Onboarding'
import Playground from './pages/Playground'
import ForgeHome from './pages/ForgeHome'
import ForgeRefresh from './pages/ForgeRefresh'
import ForgeSkill from './pages/ForgeSkill'
import ForgeInterview from './pages/ForgeInterview'
import Profile from './pages/Profile'
import ResumeGenerator from './pages/ResumeGenerator'
import FeedbackForm from './pages/FeedbackForm'
import BlogPost from './pages/BlogPost'
import BlogIndex from './pages/BlogIndex'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import GoogleSuccess from './pages/GoogleSuccess'
import GoogleComplete from './pages/GoogleComplete'
import Verify from './pages/Verify'
import AiChat from './components/AiChat'

// The AI tutor only appears once the learner is signed in.
function ChatGate() {
  const { user } = useAuth()
  return user ? <AiChat /> : null
}

// One consistent palette everywhere — the whole app always renders in the
// default Aurora theme; there is no per-user recolouring.
function ThemeController() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    applyTheme(DEFAULT_THEME)
  }, [pathname])
  return null
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 32, height: 32, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeController />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/start" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/playground" element={<ProtectedRoute><Playground /></ProtectedRoute>} />
          <Route path="/forge" element={<ProtectedRoute><ForgeHome /></ProtectedRoute>} />
          <Route path="/forge/refresh" element={<ProtectedRoute><ForgeRefresh /></ProtectedRoute>} />
          <Route path="/forge/skill/:topicKey" element={<ProtectedRoute><ForgeSkill /></ProtectedRoute>} />
          <Route path="/forge/interview" element={<ProtectedRoute><ForgeInterview /></ProtectedRoute>} />
          <Route path="/paths/new" element={<ProtectedRoute><NewPath /></ProtectedRoute>} />
          <Route path="/paths/:pathId" element={<ProtectedRoute><PathDetail /></ProtectedRoute>} />
          <Route path="/modules/:moduleId" element={<ProtectedRoute><ModulePage /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/resume" element={<ProtectedRoute><ResumeGenerator /></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute><FeedbackForm /></ProtectedRoute>} />
          <Route path="/auth/success" element={<GoogleSuccess />} />
          <Route path="/auth/complete" element={<GoogleComplete />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ChatGate />
      </BrowserRouter>
    </AuthProvider>
  )
}
