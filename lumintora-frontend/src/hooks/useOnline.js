import { useState, useEffect } from 'react'

// Tracks browser connectivity. Lumi (the AI tutor) is cloud-only, so this gates
// whether it can be used, and drives the green "online" dot on the avatar.
export function useOnline() {
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  )

  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  return online
}
