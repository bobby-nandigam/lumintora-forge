import { useState, useEffect, useMemo } from 'react'
import { Volume2, Pause, Play, Square } from 'lucide-react'

// Strip lightweight Markdown so the speech sounds natural instead of
// reading out asterisks, backticks and hash marks.
function toSpeech(md) {
  if (!md) return ''
  return md
    .replace(/```[\s\S]*?```/g, ' (code example) ')  // skip fenced code blocks
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\r/g, '')
    .replace(/\n{2,}/g, '\n\n')
    .trim()
}

// Break text into short chunks. Short utterances play more reliably
// (Chrome stalls on long ones) and keep pause/resume responsive.
function chunk(text) {
  const paras = text.split(/\n+/).map(p => p.trim()).filter(Boolean)
  const out = []
  for (const p of paras) {
    if (p.length <= 220) { out.push(p); continue }
    const sentences = p.match(/[^.!?]+[.!?]*\s*/g) || [p]
    let buf = ''
    for (const s of sentences) {
      if ((buf + s).length > 220) { if (buf.trim()) out.push(buf.trim()); buf = s }
      else buf += s
    }
    if (buf.trim()) out.push(buf.trim())
  }
  return out
}

export default function ReadAloud({ text }) {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
  const [state, setState] = useState('idle') // idle | playing | paused

  const chunks = useMemo(() => chunk(toSpeech(text)), [text])

  // Stop speaking if the text changes (navigating modules) or on unmount.
  useEffect(() => {
    if (synth) { synth.cancel(); setState('idle') }
  }, [text]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (synth) synth.cancel() }, [synth])

  if (!synth || chunks.length === 0) return null

  const play = () => {
    synth.cancel()
    chunks.forEach((c, i) => {
      const u = new SpeechSynthesisUtterance(c)
      u.rate = 1.0
      if (i === chunks.length - 1) u.onend = () => setState('idle')
      synth.speak(u)
    })
    setState('playing')
  }
  const pause = () => { synth.pause(); setState('paused') }
  const resume = () => { synth.resume(); setState('playing') }
  const stop = () => { synth.cancel(); setState('idle') }

  return (
    <div className="read-aloud">
      {state === 'idle' && (
        <button className="read-aloud-btn" onClick={play} title="Listen to this lesson">
          <Volume2 size={15} /> Read aloud
        </button>
      )}
      {state === 'playing' && (
        <>
          <button className="read-aloud-btn" onClick={pause}><Pause size={15} /> Pause</button>
          <button className="read-aloud-btn read-aloud-stop" onClick={stop}><Square size={12} /> Stop</button>
        </>
      )}
      {state === 'paused' && (
        <>
          <button className="read-aloud-btn" onClick={resume}><Play size={15} /> Resume</button>
          <button className="read-aloud-btn read-aloud-stop" onClick={stop}><Square size={12} /> Stop</button>
        </>
      )}
    </div>
  )
}
