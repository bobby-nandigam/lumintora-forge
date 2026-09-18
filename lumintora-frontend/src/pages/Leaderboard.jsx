import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import Nav from '../components/Nav'
import { Sidebar } from '../components/Nav'
import { Spinner, Empty } from '../components/UI'
import { Trophy, Flame, Zap, Medal, Crown, Award } from 'lucide-react'
import '../components/UI.css'

const rankClass = (rank) => {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return ''
}

const RankCell = ({ rank }) => {
  if (rank === 1) return <Crown size={20} color="#d99e00" />
  if (rank === 2) return <Medal size={19} color="#8a93a3" />
  if (rank === 3) return <Award size={19} color="#b9743e" />
  return <span style={{ color: 'var(--text-3)', fontWeight: 600 }}>{rank}</span>
}

const avatarColor = (name) => `hsl(${(name?.charCodeAt(0) || 65) * 13 % 360}, 52%, 52%)`

export default function Leaderboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.leaderboard().then(setEntries).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const podium = [
    { entry: entries[1], rank: 2, icon: Medal, color: '#8a93a3', h: 116 },
    { entry: entries[0], rank: 1, icon: Crown, color: '#d99e00', h: 150 },
    { entry: entries[2], rank: 3, icon: Award, color: '#b9743e', h: 96 },
  ]

  return (
    <div>
      <Nav />
      <div className="layout">
        <Sidebar />
        <main className="main animate-fade">
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Trophy size={22} color="var(--amber)" />
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,38px)', fontWeight: 600, letterSpacing: '-0.02em' }}>Leaderboard</h1>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: 15 }}>Top learners this month, ranked by XP earned.</p>
          </div>

          {/* Top 3 podium */}
          {!loading && entries.length >= 3 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, marginBottom: 40 }}>
              {podium.map(({ entry, rank, icon: Icon, color, h }) => (
                <div key={rank} style={{ textAlign: 'center', flex: 1, maxWidth: rank === 1 ? 184 : 162 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                    <Icon size={rank === 1 ? 34 : 28} color={color} />
                  </div>
                  <div style={{
                    background: rank === 1 ? 'linear-gradient(180deg, rgba(217,158,0,0.08), var(--bg-1))' : 'var(--bg-1)',
                    border: `1px solid ${rank === 1 ? 'rgba(217,158,0,0.3)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)', padding: '20px 16px', height: h, boxShadow: 'var(--shadow-sm)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 6,
                  }}>
                    <div className="avatar" style={{ width: 40, height: 40, fontSize: 15, background: avatarColor(entry?.name) }}>
                      {entry?.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{entry?.name}</div>
                    {entry?.username && (
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>@{entry.username}</div>
                    )}
                    <div style={{ fontSize: 12, color: 'var(--accent-ink)', fontWeight: 700 }}>{entry?.xp} XP</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full table */}
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={32} /></div>
            ) : entries.length === 0 ? (
              <Empty icon={Trophy} title="No entries yet" description="Be the first to earn XP and claim the top spot." />
            ) : (
              <table className="lb-table">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="lb-td" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 60 }}>#</th>
                    <th className="lb-td" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>Learner</th>
                    <th className="lb-td" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>XP</th>
                    <th className="lb-td" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const isMe = entry.id === user?.id
                    return (
                      <tr key={entry.id} className="lb-row" style={{ background: isMe ? 'var(--accent-soft)' : undefined }}>
                        <td className={`lb-td lb-rank ${rankClass(entry.rank)}`}>
                          <RankCell rank={entry.rank} />
                        </td>
                        <td className="lb-td">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar" style={{ width: 34, height: 34, fontSize: 13, background: avatarColor(entry.name) }}>
                              {entry.name[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>
                                {entry.name}
                                {isMe && <span style={{ fontSize: 11, color: 'var(--accent-ink)', marginLeft: 6, fontWeight: 600 }}>you</span>}
                              </div>
                              {entry.username && (
                                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>@{entry.username}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="lb-td" style={{ textAlign: 'right' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 700, color: 'var(--accent-ink)' }}>
                            <Zap size={13} /> {entry.xp}
                          </span>
                        </td>
                        <td className="lb-td" style={{ textAlign: 'right' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, color: 'var(--rose)' }}>
                            <Flame size={13} /> {entry.streak}d
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
