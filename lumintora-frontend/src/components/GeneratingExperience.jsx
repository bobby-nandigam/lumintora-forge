import { useState, useEffect, useRef } from 'react'
import { Check, Sparkles, Brain, Map, Trophy, Wand2 } from 'lucide-react'

// Staged, theme-coloured "we're building your path" experience.
// Self-paced over ~8s and loops its final stage so it never looks stuck
// if the AI call runs long. Purely cosmetic — the parent owns the real request.

const STAGES = [
  { icon: Brain,    label: 'Understanding your goals',     ms: 1600 },
  { icon: Map,      label: 'Mapping your learning journey', ms: 2200 },
  { icon: Wand2,    label: 'Crafting bite-size modules',    ms: 2200 },
  { icon: Trophy,   label: 'Adding XP, quests & rewards',   ms: 1800 },
  { icon: Sparkles, label: 'Polishing the final touches',   ms: 4000 },
]

const FACTS = [
  'Learners who set a clear goal are 3× more likely to finish.',
  'Short, spaced sessions beat marathon cramming for memory.',
  'Every module you finish earns XP and climbs the leaderboard.',
  'Quizzes are generated fresh — no two paths are identical.',
  'Teaching a concept back is one of the fastest ways to master it.',
  'A 7-day streak roughly doubles long-term retention.',
  'Your path adapts to your level, so it is never too easy or too hard.',
]

export default function GeneratingExperience({ interest, error, onRetry }) {
  const [stage, setStage] = useState(0)
  const [progress, setProgress] = useState(4)
  const [fact, setFact] = useState(0)
  const stageRef = useRef(0)

  // Advance stages on their individual durations; loop the last one.
  useEffect(() => {
    if (error) return
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      const i = stageRef.current
      const next = i < STAGES.length - 1 ? i + 1 : STAGES.length - 1
      stageRef.current = next
      setStage(next)
      timer = setTimeout(tick, STAGES[next].ms)
    }
    let timer = setTimeout(tick, STAGES[0].ms)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [error])

  // Smooth, easing progress that approaches but never reaches 100 until done.
  useEffect(() => {
    if (error) return
    const id = setInterval(() => {
      setProgress(p => (p >= 96 ? 96 : p + Math.max(0.4, (96 - p) * 0.06)))
    }, 120)
    return () => clearInterval(id)
  }, [error])

  // Rotate the fun facts.
  useEffect(() => {
    if (error) return
    const id = setInterval(() => setFact(f => (f + 1) % FACTS.length), 2800)
    return () => clearInterval(id)
  }, [error])

  if (error) {
    return (
      <div className="gen-stage animate-fade">
        <div className="gen-orb gen-orb-error" />
        <h2 className="gen-title">That didn't quite work</h2>
        <p className="gen-sub">{error}</p>
        <button className="btn btn-primary btn-lg" onClick={onRetry} style={{ marginTop: 8 }}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="gen-stage animate-fade">
      <div className="gen-orb">
        <Sparkles size={30} className="gen-orb-icon" />
      </div>

      <h2 className="gen-title">Building your path</h2>
      <p className="gen-sub">
        {interest ? <>Personalising around <strong>{interest}</strong>…</> : 'Personalising your journey…'}
      </p>

      <div className="gen-progress">
        <div className="gen-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="gen-percent">{Math.round(progress)}%</div>

      <div className="gen-steps">
        {STAGES.map((s, i) => {
          const Icon = s.icon
          const state = i < stage ? 'done' : i === stage ? 'active' : 'todo'
          return (
            <div key={s.label} className={`gen-step gen-step-${state}`}>
              <div className="gen-step-icon">
                {state === 'done' ? <Check size={14} /> : <Icon size={14} />}
              </div>
              <span>{s.label}</span>
            </div>
          )
        })}
      </div>

      <div className="gen-fact" key={fact}>
        <span className="gen-fact-tag">Did you know</span>
        {FACTS[fact]}
      </div>
    </div>
  )
}
