import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import Nav, { Sidebar } from '../components/Nav'
import { Spinner } from '../components/UI'
import { RefreshCw, GraduationCap, Mic, ArrowRight, Clock, Flame, Zap, TrendingUp } from 'lucide-react'
import '../components/UI.css'
import './Forge.css'

// mastery -> colour token
export function masteryColor(m) {
  if (m >= 80) return 'var(--green)'
  if (m >= 55) return 'var(--amber)'
  return 'var(--rose)'
}

export default function ForgeHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true); setError('')
    api.forgeSkills()
      .then(setData)
      .catch(e => setError(e.message || 'Could not load your engineering memory'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const first = user?.name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <Nav />
      <div className="layout">
        <Sidebar />
        <main className="main animate-fade">
          <div className="dash-header">
            <div className="dash-greeting"><span className="forge-badge-tag">⚒ Forge · Feature</span></div>
            <h1 className="forge-hero-line">Refresh, master, or interview.</h1>
            <p className="forge-sub">Forge finds what you've forgotten and rebuilds it with targeted practice — pick a mode to begin.</p>
          </div>

          {/* Three modes */}
          <div className="forge-modes">
            <button className="forge-mode primary" onClick={() => navigate('/forge/refresh')}>
              <div className="forge-mode-ico"><RefreshCw size={20} /></div>
              <div className="forge-mode-kicker">Fastest</div>
              <div className="forge-mode-title">Start a Refresh</div>
              <div className="forge-mode-desc">A 10-minute adaptive diagnostic finds your gaps, then rebuilds them.</div>
              <span className="forge-mode-go">Begin <ArrowRight size={15} /></span>
            </button>
            <button className="forge-mode" onClick={() => navigate('/forge/refresh?mode=master')}>
              <div className="forge-mode-ico"><GraduationCap size={20} /></div>
              <div className="forge-mode-kicker">Go deeper</div>
              <div className="forge-mode-title">Build Mastery</div>
              <div className="forge-mode-desc">Strengthen a weak area from the ground up until it sticks.</div>
              <span className="forge-mode-go">Choose a skill <ArrowRight size={15} /></span>
            </button>
            <button className="forge-mode" onClick={() => navigate('/forge/interview')}>
              <div className="forge-mode-ico"><Mic size={20} /></div>
              <div className="forge-mode-kicker">Pressure-test</div>
              <div className="forge-mode-title">Start Interview</div>
              <div className="forge-mode-desc">A live AI interviewer probes your reasoning with follow-ups, then debriefs you.</div>
              <span className="forge-mode-go">Practice <ArrowRight size={15} /></span>
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={32} /></div>
          ) : error ? (
            <div className="sess-feedback mid">
              {error} <button className="btn btn-ghost btn-sm" onClick={load} style={{ marginLeft: 8 }}>Retry</button>
            </div>
          ) : (
            <>
              {/* Engineering memory */}
              <div className="forge-sec-head">
                <div className="forge-sec-title">Your engineering memory</div>
                <div className="forge-sec-hint">A learning signal — not an exact score</div>
              </div>
              <div className="forge-memory">
                {(data?.memory || []).map(s => (
                  <div key={s.key} className="mem-row" onClick={() => navigate(`/forge/skill/${s.key}`)} role="button" tabIndex={0}
                       onKeyDown={e => e.key === 'Enter' && navigate(`/forge/skill/${s.key}`)}>
                    <div className="mem-name">{s.name}</div>
                    <div className="mem-bar"><i style={{ width: `${s.mastery}%`, background: masteryColor(s.mastery) }} /></div>
                    <div className="mem-pct" style={{ color: masteryColor(s.mastery) }}>{s.mastery}%</div>
                    {s.decayed
                      ? <span className="mem-flag">decayed</span>
                      : <span style={{ width: 1 }} />}
                  </div>
                ))}
                {(!data?.memory || data.memory.length === 0) && (
                  <p className="forge-sub">No skills tracked yet — start a refresh to map your memory.</p>
                )}
              </div>

              {/* Recommended */}
              {(data?.recommended || []).length > 0 && (
                <>
                  <div className="forge-sec-head"><div className="forge-sec-title">Recommended for you</div></div>
                  <div className="forge-recs">
                    {data.recommended.map(r => (
                      <div key={r.key} className="rec-card">
                        <div className="rec-name">{r.name}</div>
                        <div className="rec-reason">{r.reason}</div>
                        <div className="rec-meta"><Clock size={13} /> {r.minutes} min</div>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/forge/refresh?topic=${r.key}&minutes=${r.minutes}`)}>
                          <RefreshCw size={14} /> Refresh {r.name}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Recent progress */}
              {(data?.recent || []).length > 0 && (
                <>
                  <div className="forge-sec-head"><div className="forge-sec-title">Recent progress</div></div>
                  <div className="forge-recent">
                    {data.recent.map((r, i) => (
                      <div key={i} className="recent-card">
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>{r.topic}</div>
                        <div className="recent-delta">
                          <span style={{ color: 'var(--text-3)' }}>{r.before}%</span>
                          {' → '}
                          <span style={{ color: masteryColor(r.after) }}>{r.after}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
