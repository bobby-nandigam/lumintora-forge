import { useState, useEffect } from 'react'
import Nav, { Sidebar } from '../components/Nav'
import CodeJudge from '../components/CodeJudge'
import { PROBLEMS, difficultyColor } from '../lib/problems'
import { Code2, Check, Zap, ChevronRight, ArrowLeft } from 'lucide-react'
import '../components/UI.css'

// Real LeetCode-style practice: browse the problem list, open one, and solve it
// against sample + hidden test cases with Run / Submit and an AI debug assistant.

const SOLVED_KEY = 'lumintora_solved'
const loadSolved = () => {
  try { return new Set(JSON.parse(localStorage.getItem(SOLVED_KEY) || '[]')) } catch { return new Set() }
}

export default function Playground() {
  const [activeId, setActiveId] = useState(null) // null → list view
  const [solved, setSolved] = useState(loadSolved)

  useEffect(() => {
    localStorage.setItem(SOLVED_KEY, JSON.stringify([...solved]))
  }, [solved])

  const markSolved = (id) => setSolved((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
  const problem = activeId ? PROBLEMS.find((p) => p.id === activeId) : null

  return (
    <div>
      <Nav />
      <div className="layout">
        <Sidebar />
        <main className="main main-wide animate-fade">
          {!problem ? (
            <>
              <div className="pg-head">
                <div className="pg-head-icon"><Code2 size={20} /></div>
                <div>
                  <h1 className="pg-title">Coding Practice</h1>
                  <p className="pg-sub">
                    Pick a problem, solve it against real <strong>test cases</strong>, and use <strong>AI Debug</strong> to find & fix flaws.
                    <span className="pg-solved-count"><Zap size={13} /> {solved.size}/{PROBLEMS.length} solved</span>
                  </p>
                </div>
              </div>

              <div className="pg-list">
                {PROBLEMS.map((p) => (
                  <button key={p.id} className="pg-list-item" onClick={() => setActiveId(p.id)}>
                    <span className={`pg-list-check ${solved.has(p.id) ? 'done' : ''}`}>
                      {solved.has(p.id) ? <Check size={14} /> : <span className="pg-list-dot" />}
                    </span>
                    <span className="pg-list-main">
                      <span className="pg-list-title">{p.title}</span>
                      {p.tags?.length > 0 && <span className="pg-list-tags">{p.tags.slice(0, 3).join(' · ')}</span>}
                    </span>
                    <span className="pg-list-diff" style={{ color: difficultyColor[p.difficulty], background: difficultyColor[p.difficulty] + '18' }}>
                      {p.difficulty}
                    </span>
                    <ChevronRight size={16} className="pg-list-arrow" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="pg-detail-bar">
                <button className="btn btn-ghost btn-sm" onClick={() => setActiveId(null)}>
                  <ArrowLeft size={14} /> All problems
                </button>
                <span className="pg-solved-count"><Zap size={13} /> {solved.size}/{PROBLEMS.length} solved</span>
              </div>
              <CodeJudge
                key={problem.id}
                problem={problem}
                solved={solved.has(problem.id)}
                onSolved={markSolved}
              />
            </>
          )}
        </main>
      </div>
    </div>
  )
}
