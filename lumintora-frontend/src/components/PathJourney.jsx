import {
  BookOpen, Code2, Brain, CheckSquare, Lock, Check, Play, Flag, Trophy, Star, Wand2,
} from 'lucide-react'

// A gamified "journey map": modules become a vertical winding trail of nodes
// (Duolingo-style) along a central spine. Locked / active / completed states,
// XP rewards, and a START → FINISH framing make progress feel like a quest.

const typeIcon = { lesson: BookOpen, code: Code2, quiz: Brain, project: CheckSquare }
const typeLabel = { lesson: 'Lesson', code: 'Code', quiz: 'Quiz', project: 'Project' }

export default function PathJourney({ modules = [], onSelect }) {
  const firstActiveIndex = modules.findIndex(
    m => m.status === 'available' || m.status === 'in_progress'
  )

  return (
    <div className="journey">
      <div className="journey-cap journey-start">
        <Flag size={14} /> START
      </div>

      {modules.map((mod, i) => {
        const Icon = typeIcon[mod.type] || BookOpen
        const isLocked = mod.status === 'locked'
        const isDone = mod.status === 'completed'
        const isCurrent = i === firstActiveIndex
        const side = i % 2 === 0 ? 'left' : 'right'
        const state = isDone ? 'done' : isLocked ? 'locked' : 'active'

        return (
          <div key={mod.id} className={`journey-node journey-${side} journey-${state} ${isCurrent ? 'journey-current' : ''}`}>
            {isCurrent && <div className="journey-here">You're here</div>}

            <button
              className="journey-bubble"
              disabled={isLocked}
              onClick={() => !isLocked && onSelect?.(mod.id)}
              aria-label={mod.title}
            >
              {isDone ? <Check size={22} /> : isLocked ? <Lock size={18} /> : <Icon size={20} />}
              <span className="journey-step">{i + 1}</span>
              {isCurrent && <span className="journey-pulse" />}
            </button>

            <button
              className="journey-label"
              disabled={isLocked}
              onClick={() => !isLocked && onSelect?.(mod.id)}
            >
              <div className="journey-type">{typeLabel[mod.type] || 'Lesson'}</div>
              <div className="journey-label-title">{mod.title}</div>
              <div className="journey-label-meta">
                <span className="journey-xp"><Star size={11} /> {mod.xp_reward} XP</span>
                <span>{mod.duration_minutes}m</span>
                {isCurrent && <span className="journey-cta"><Play size={11} /> Continue</span>}
              </div>
              {mod.source === 'adaptive' && (
                <span className="journey-adaptive-tag" title={mod.adaptive_reason || 'Added by adaptive learning'}>
                  <Wand2 size={10} /> Adaptive
                </span>
              )}
            </button>
          </div>
        )
      })}

      <div className="journey-cap journey-finish">
        <Trophy size={15} /> FINISH
      </div>
    </div>
  )
}
