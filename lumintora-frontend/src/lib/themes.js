// ════════════════════════════════════════════════════════════
//  Lumintora theme palettes
//  A learner picks a "favourite theme" during onboarding; the whole
//  app re-skins by overriding the accent CSS variables on :root.
//  The choice is persisted so it survives reloads.
// ════════════════════════════════════════════════════════════

const STORAGE_KEY = 'lumintora_theme'

// Each theme supplies a base accent hue + a two-stop gradient.
// Soft / border / glow variants are derived from the accent at apply time,
// so adding a theme only needs four colours.
export const THEMES = [
  {
    id: 'aurora',
    name: 'Aurora',
    emoji: '🔮',
    blurb: 'Violet & electric — the classic Lumintora.',
    accent: '#7140ff', accentHover: '#5e2cf0', accent2: '#8b6bff', accentInk: '#5b30d8',
    gradFrom: '#8b6bff', gradTo: '#6a45f5',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    blurb: 'Cool teal & deep blue — calm and focused.',
    accent: '#0891b2', accentHover: '#0e7490', accent2: '#22b8cf', accentInk: '#0e7490',
    gradFrom: '#22b8cf', gradTo: '#0c7ba0',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    blurb: 'Warm coral & amber — energetic and bold.',
    accent: '#f0562c', accentHover: '#dc4420', accent2: '#fb7185', accentInk: '#c2410c',
    gradFrom: '#fb7185', gradTo: '#f0562c',
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🌲',
    blurb: 'Fresh green — grounded and growing.',
    accent: '#0f9d6b', accentHover: '#0c855a', accent2: '#34d399', accentInk: '#0c7a52',
    gradFrom: '#34d399', gradTo: '#0f9d6b',
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    emoji: '✨',
    blurb: 'Indigo & magenta — dreamy and ambitious.',
    accent: '#7c3aed', accentHover: '#6d28d9', accent2: '#c026d3', accentInk: '#6d28d9',
    gradFrom: '#c026d3', gradTo: '#6d28d9',
  },
]

export const DEFAULT_THEME = 'aurora'

export const getTheme = (id) => THEMES.find(t => t.id === id) || THEMES[0]

// #rrggbb -> "r, g, b"
function rgbParts(hex) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

// Apply a theme by overriding the accent-family variables on :root.
export function applyTheme(id) {
  const t = getTheme(id)
  const rgb = rgbParts(t.accent)
  const root = document.documentElement
  const set = (k, v) => root.style.setProperty(k, v)

  set('--accent', t.accent)
  set('--accent-hover', t.accentHover)
  set('--accent-2', t.accent2)
  set('--accent-ink', t.accentInk)
  set('--accent-soft', `rgba(${rgb}, 0.08)`)
  set('--accent-softer', `rgba(${rgb}, 0.045)`)
  set('--accent-border', `rgba(${rgb}, 0.22)`)
  set('--border-accent', `rgba(${rgb}, 0.28)`)
  set('--accent-glow', `rgba(${rgb}, 0.30)`)
  set('--grad', `linear-gradient(135deg, ${t.gradFrom} 0%, ${t.gradTo} 100%)`)
  set('--grad-deep', `linear-gradient(135deg, ${t.accent} 0%, ${t.accentInk} 100%)`)
  set('--shadow-accent', `0 12px 30px -10px rgba(${rgb}, 0.32)`)

  root.setAttribute('data-theme', t.id)
  return t
}

export function saveTheme(id) {
  try { localStorage.setItem(STORAGE_KEY, id) } catch {}
  return applyTheme(id)
}

export function loadTheme() {
  let id = DEFAULT_THEME
  try { id = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME } catch {}
  return applyTheme(id)
}

export const getSavedThemeId = () => {
  try { return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME } catch { return DEFAULT_THEME }
}
