import { useMemo, useState } from 'react'

// A GitHub-style contributions grid driven by the /me/activity endpoint.
// `days` is an array of { date: 'YYYY-MM-DD', count, xp }.

const WEEKS = 53
const DAY_MS = 86400000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const ymd = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Map a raw count to one of 5 intensity levels (0 = empty).
function level(count) {
  if (!count) return 0
  if (count >= 8) return 4
  if (count >= 5) return 3
  if (count >= 3) return 2
  return 1
}

export default function StreakHeatmap({ days = [] }) {
  const [hover, setHover] = useState(null) // { x, y, label }

  const { columns, monthLabels } = useMemo(() => {
    const byDate = new Map(days.map((d) => [d.date, d]))

    // Anchor the grid to the end of the current week so "today" sits in the
    // last column, then walk back WEEKS*7 days to the first cell (a Sunday).
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const end = new Date(today)
    end.setDate(end.getDate() + (6 - end.getDay())) // Saturday of this week
    const start = new Date(end)
    start.setDate(start.getDate() - (WEEKS * 7 - 1)) // Sunday, 53 weeks back

    const cols = []
    const labels = []
    let lastMonth = -1

    for (let w = 0; w < WEEKS; w++) {
      const col = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(start.getTime() + (w * 7 + d) * DAY_MS)
        const key = ymd(date)
        const rec = byDate.get(key)
        const future = date.getTime() > today.getTime()
        col.push({
          key,
          date,
          future,
          count: rec?.count || 0,
          xp: rec?.xp || 0,
          lvl: future ? -1 : level(rec?.count || 0),
        })
        // Record a month label at the top of the first week that enters a new month.
        if (d === 0) {
          const m = date.getMonth()
          if (m !== lastMonth) {
            labels.push({ w, text: MONTHS[m] })
            lastMonth = m
          }
        }
      }
      cols.push(col)
    }
    return { columns: cols, monthLabels: labels }
  }, [days])

  const fmtLabel = (cell) => {
    const nice = cell.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    if (cell.future) return nice
    if (!cell.count) return `No activity · ${nice}`
    const unit = cell.count === 1 ? 'contribution' : 'contributions'
    return `${cell.count} ${unit}${cell.xp ? ` · +${cell.xp} XP` : ''} · ${nice}`
  }

  return (
    <div className="heatmap" onMouseLeave={() => setHover(null)}>
      <div className="heatmap-scroll">
        <div className="heatmap-months">
          {monthLabels.map((m) => (
            <span key={`${m.text}-${m.w}`} className="heatmap-month" style={{ gridColumn: m.w + 2 }}>
              {m.text}
            </span>
          ))}
        </div>

        <div className="heatmap-body">
          <div className="heatmap-weekdays">
            <span />
            <span>Mon</span>
            <span />
            <span>Wed</span>
            <span />
            <span>Fri</span>
            <span />
          </div>

          <div className="heatmap-grid">
            {columns.map((col, ci) => (
              <div key={ci} className="heatmap-col">
                {col.map((cell) => (
                  <div
                    key={cell.key}
                    className={`heatmap-cell ${cell.lvl === -1 ? 'is-future' : `lvl-${cell.lvl}`}`}
                    onMouseEnter={(e) => {
                      if (cell.future) return setHover(null)
                      const r = e.currentTarget.getBoundingClientRect()
                      const host = e.currentTarget.closest('.heatmap').getBoundingClientRect()
                      setHover({ x: r.left - host.left + r.width / 2, y: r.top - host.top, label: fmtLabel(cell) })
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {hover && (
        <div className="heatmap-tip" style={{ left: hover.x, top: hover.y }}>
          {hover.label}
        </div>
      )}

      <div className="heatmap-legend">
        <span>Less</span>
        <span className="heatmap-cell lvl-0" />
        <span className="heatmap-cell lvl-1" />
        <span className="heatmap-cell lvl-2" />
        <span className="heatmap-cell lvl-3" />
        <span className="heatmap-cell lvl-4" />
        <span>More</span>
      </div>
    </div>
  )
}
