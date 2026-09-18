/**
 * Lumintora brand mark — two overlapping rounded-square OUTLINES: a dark one
 * behind (top-left) and a violet one in front (bottom-right). The front square
 * is filled with the surface colour so it cleanly masks the dark square where
 * they overlap. Scales from favicon to hero size.
 */
export function LogoMark({ size = 32, className = '', accent = '#7140ff', dark = 'currentColor', surface = 'var(--bg-1)' }) {
  const sw = 3.1
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* back square — dark outline */}
      <rect x="5" y="5" width="20.6" height="20.6" rx="6.8" fill="none" stroke={dark} strokeWidth={sw} />
      {/* front square — violet outline, surface fill masks the dark square behind */}
      <rect x="18" y="18" width="20.6" height="20.6" rx="6.8" fill={surface} stroke={accent} strokeWidth={sw} />
    </svg>
  )
}

/**
 * Full lockup: mark + "lumintora" wordmark. `variant="compact"` hides the
 * wordmark; `wordColor` overrides the text colour (defaults to brand text).
 */
export default function Logo({ size = 30, withText = true, fontSize, className = '', wordColor = 'var(--text)', surface, dark, accent }) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.34, lineHeight: 1, color: 'var(--text)' }}
    >
      <LogoMark size={size} surface={surface} dark={dark} accent={accent} />
      {withText && (
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: fontSize || size * 0.78,
            letterSpacing: '-0.03em',
            color: wordColor,
          }}
        >
          lumintora
        </span>
      )}
    </span>
  )
}
