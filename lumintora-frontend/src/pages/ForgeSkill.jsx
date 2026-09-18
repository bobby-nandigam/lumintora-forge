import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import Nav, { Sidebar } from '../components/Nav'
import { Spinner } from '../components/UI'
import { masteryColor } from './ForgeHome'
import { ArrowLeft, RefreshCw, Target } from 'lucide-react'
import '../components/UI.css'
import './Forge.css'

export default function ForgeSkill() {
  const { topicKey } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.forgeSkillDetail(topicKey).then(setData).catch(e => setError(e.message || 'Could not load this skill'))
  }, [topicKey])

  return (
    <div>
      <Nav />
      <div className="layout">
        <Sidebar />
        <main className="main animate-fade">
          <div className="forge-session">
            <Link to="/forge" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
              <ArrowLeft size={14} /> Forge
            </Link>

            {error ? <div className="sess-feedback mid">{error}</div>
            : !data ? <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><Spinner size={32} /></div>
            : (
              <>
                <div className="sess-kicker">Skill</div>
                <h1 className="sess-skill">{data.name}</h1>
                <p className="sess-progress-line">Overall memory <span style={{ color: masteryColor(data.mastery), fontWeight: 700 }}>{data.mastery}%</span></p>

                <div className="forge-sec-head"><div className="forge-sec-title">Sub-skills</div></div>
                <div className="forge-memory">
                  {(data.skills || []).map(s => (
                    <div key={s.key} className="mem-row" style={{ cursor: 'default' }}>
                      <div className="mem-name">{s.name}</div>
                      <div className="mem-bar"><i style={{ width: `${s.mastery}%`, background: masteryColor(s.mastery) }} /></div>
                      <div className="mem-pct" style={{ color: masteryColor(s.mastery) }}>{s.mastery}%</div>
                      <span style={{ width: 1 }} />
                    </div>
                  ))}
                </div>

                {data.biggest_gap?.name && (
                  <div className="narrative-box" style={{ marginTop: 20 }}>
                    <Target size={15} style={{ verticalAlign: -2, marginRight: 6 }} />
                    Your biggest gap is <strong>{data.biggest_gap.name}</strong> ({data.biggest_gap.mastery}%).
                  </div>
                )}

                <div className="sess-actions">
                  <button className="btn btn-primary btn-md" onClick={() => navigate(`/forge/refresh?topic=${data.key}`)}>
                    <RefreshCw size={16} /> Start 10-min refresh
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
