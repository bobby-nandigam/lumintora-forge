import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import Nav, { Sidebar } from '../components/Nav'
import { Spinner } from '../components/UI'
import { masteryColor } from './ForgeHome'
import {
  ArrowLeft, Mic, MicOff, Send, Loader2, CheckCircle2, Trophy, Target,
  Video, VideoOff, Camera,
} from 'lucide-react'
import '../components/UI.css'
import './Forge.css'

const DIM_LABELS = {
  requirements: 'Requirements', api_design: 'API Design', data_modeling: 'Data Modeling',
  scalability: 'Scalability', caching: 'Caching', reliability: 'Reliability',
  failure_handling: 'Failure Handling', tradeoffs: 'Tradeoffs', communication: 'Communication',
  composure: 'Composure (on camera)',
}
const EXPR_KEYS = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised']
const FACE_MODELS = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'

// Load the face-api UMD bundle once, from CDN (kept out of the app bundle).
let faceApiPromise = null
function loadFaceApi() {
  if (typeof window === 'undefined') return Promise.reject()
  if (window.faceapi) return Promise.resolve(window.faceapi)
  if (faceApiPromise) return faceApiPromise
  faceApiPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js'
    s.async = true
    s.onload = () => resolve(window.faceapi)
    s.onerror = () => reject(new Error('face-api failed to load'))
    document.head.appendChild(s)
  })
  return faceApiPromise
}

const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

export default function ForgeInterview() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const topicKey = params.get('topic') || ''

  const [phase, setPhase] = useState('loading') // loading | chat | done
  const [interviewId, setInterviewId] = useState(null)
  const [topicName, setTopicName] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [turn, setTurn] = useState(0)
  const [canFinish, setCanFinish] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [evalResult, setEvalResult] = useState(null)
  const scrollRef = useRef(null)

  // ── media (camera + face-api) ──
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const faceLoopRef = useRef(null)
  const accRef = useRef(Object.fromEntries(EXPR_KEYS.map(k => [k, 0])))
  const samplesRef = useRef({ total: 0, face: 0 })
  const [camState, setCamState] = useState('idle') // idle | on | error
  const [faceReady, setFaceReady] = useState(false)
  const [liveExpr, setLiveExpr] = useState('')

  // ── voice ──
  const recogRef = useRef(null)
  const wordsRef = useRef(0)
  const [listening, setListening] = useState(false)

  /* start the interview */
  useEffect(() => {
    api.forgeInterviewStart(topicKey)
      .then(d => {
        setInterviewId(d.interview_id); setTopicName(d.topic_name)
        setMessages([{ role: 'interviewer', content: d.prompt }])
        setPhase('chat')
      })
      .catch(e => { setError(e.message || 'Could not start the interview'); setPhase('chat') })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* camera + expression sampling — best effort, degrades gracefully */
  useEffect(() => {
    if (phase !== 'chat') return
    let cancelled = false
    ;(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}) }
        setCamState('on')
        try {
          const faceapi = await loadFaceApi()
          await faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODELS)
          await faceapi.nets.faceExpressionNet.loadFromUri(FACE_MODELS)
          if (cancelled) return
          setFaceReady(true)
          faceLoopRef.current = setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) return
            try {
              const res = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 }))
                .withFaceExpressions()
              samplesRef.current.total++
              if (res && res.expressions) {
                samplesRef.current.face++
                let dom = 'neutral', best = -1
                for (const k of EXPR_KEYS) {
                  const v = res.expressions[k] || 0
                  accRef.current[k] += v
                  if (v > best) { best = v; dom = k }
                }
                setLiveExpr(dom)
              }
            } catch { /* transient frame error */ }
          }, 1500)
        } catch { setFaceReady(false) /* camera on, expressions unavailable */ }
      } catch { setCamState('error') }
    })()
    return () => {
      cancelled = true
      if (faceLoopRef.current) clearInterval(faceLoopRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [phase])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  const stopMedia = useCallback(() => {
    if (faceLoopRef.current) clearInterval(faceLoopRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (recogRef.current) { try { recogRef.current.stop() } catch {} }
  }, [])

  function computeDelivery() {
    const s = samplesRef.current
    const spoke = wordsRef.current > 0
    if (!faceReady || s.face === 0) {
      if (!spoke) return { enabled: false }
      return { enabled: true, composure: 62, eye_contact: 0, dominant_expression: '', expressions: {}, spoke: true, words_spoken: wordsRef.current }
    }
    const acc = accRef.current
    const sum = EXPR_KEYS.reduce((t, k) => t + acc[k], 0) || 1
    const pct = {}; EXPR_KEYS.forEach(k => { pct[k] = Math.round((acc[k] / sum) * 100) })
    const positive = pct.neutral + pct.happy
    const mild = pct.surprised
    const negative = pct.angry + pct.fearful + pct.sad + pct.disgusted
    const eye = Math.round((s.face / Math.max(s.total, 1)) * 100)
    let composure = positive + 0.5 * mild - 0.6 * negative
    composure = Math.round(Math.max(0, Math.min(100, composure)) * (0.6 + 0.4 * eye / 100))
    let dominant = 'neutral', best = -1
    for (const k of EXPR_KEYS) { if (pct[k] > best) { best = pct[k]; dominant = k } }
    return { enabled: true, composure, eye_contact: eye, dominant_expression: dominant, expressions: pct, spoke, words_spoken: wordsRef.current }
  }

  function toggleVoice() {
    if (!SR) return
    if (listening) { try { recogRef.current?.stop() } catch {}; return }
    const rec = new SR()
    rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US'
    rec.onresult = (e) => {
      let finalChunk = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalChunk += e.results[i][0].transcript
      }
      if (finalChunk.trim()) {
        wordsRef.current += finalChunk.trim().split(/\s+/).filter(Boolean).length
        setInput(prev => (prev ? prev + ' ' : '') + finalChunk.trim())
      }
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recogRef.current = rec
    try { rec.start(); setListening(true) } catch { setListening(false) }
  }

  async function send() {
    const msg = input.trim()
    if (!msg || busy) return
    setInput(''); setError('')
    setMessages(m => [...m, { role: 'candidate', content: msg }])
    setBusy(true)
    try {
      const r = await api.forgeInterviewReply(interviewId, msg)
      setMessages(m => [...m, { role: 'interviewer', content: r.reply }])
      setTurn(r.turn); setCanFinish(r.can_finish)
    } catch (e) {
      setError(e.message || 'The interviewer did not respond — try again')
    } finally { setBusy(false) }
  }

  async function finish() {
    setBusy(true); setError('')
    const delivery = computeDelivery()
    try {
      const r = await api.forgeInterviewFinish(interviewId, delivery)
      stopMedia()
      setEvalResult(r); setPhase('done')
    } catch (e) {
      setError(e.message || 'Could not evaluate the interview')
    } finally { setBusy(false) }
  }

  return (
    <div>
      <Nav />
      <div className="layout">
        <Sidebar />
        <main className="main animate-fade">
          <div className="forge-session" style={{ maxWidth: phase === 'chat' ? 940 : 780 }}>
            <Link to="/forge" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
              <ArrowLeft size={14} /> Forge
            </Link>

            {phase === 'loading' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 64 }}>
                <Spinner size={32} /><p className="forge-sub">Your interviewer is preparing a question…</p>
              </div>
            )}

            {phase === 'chat' && (
              <>
                <div className="sess-kicker"><Mic size={13} style={{ verticalAlign: -2 }} /> AI Interview{topicName ? ` · ${topicName}` : ''}</div>
                <h1 className="sess-skill">Think out loud — reason like the whiteboard's real.</h1>
                <p className="sess-progress-line">{turn}/5 follow-ups · speak or type your answers</p>

                <div className="iv-layout">
                  {/* Camera / presence panel */}
                  <div className="iv-cam-panel">
                    <div className="iv-cam-frame">
                      <video ref={videoRef} muted playsInline className="iv-cam-video" style={{ display: camState === 'on' ? 'block' : 'none' }} />
                      {camState !== 'on' && (
                        <div className="iv-cam-off">
                          {camState === 'error' ? <VideoOff size={26} /> : <Camera size={26} />}
                          <span>{camState === 'error' ? 'Camera off' : 'Starting camera…'}</span>
                        </div>
                      )}
                      {camState === 'on' && <span className="iv-cam-live"><i /> LIVE</span>}
                    </div>
                    <div className="iv-cam-meta">
                      {camState === 'on' ? (
                        faceReady ? (
                          <><Video size={13} /> Presence tracking on{liveExpr ? ` · ${liveExpr}` : ''}</>
                        ) : (
                          <><Video size={13} /> Camera on · loading expression model…</>
                        )
                      ) : camState === 'error' ? (
                        <>Camera denied — the interview still works. Enable it for presence feedback.</>
                      ) : 'Requesting camera…'}
                    </div>
                    <div className="iv-cam-note">Face &amp; voice are a confidence/engagement signal — they lightly inform your communication score, not your technical scores.</div>
                  </div>

                  {/* Chat */}
                  <div className="sess-card" style={{ padding: 0 }}>
                    <div ref={scrollRef} className="iv-scroll">
                      {messages.map((m, i) => (
                        <div key={i} className={`iv-msg iv-${m.role}`}>
                          <div className="iv-role">{m.role === 'interviewer' ? 'Interviewer' : 'You'}</div>
                          <div className="iv-bubble">{m.content}</div>
                        </div>
                      ))}
                      {busy && phase === 'chat' && (
                        <div className="iv-msg iv-interviewer"><div className="iv-role">Interviewer</div><div className="iv-bubble"><Loader2 size={15} className="spin" /> thinking…</div></div>
                      )}
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', padding: 14 }}>
                      {error && <div className="sess-feedback mid" style={{ marginBottom: 10 }}>{error}</div>}
                      <textarea className="sess-textarea" style={{ minHeight: 84 }}
                        placeholder={listening ? 'Listening… speak your answer' : 'Type your answer, or tap the mic to speak…'}
                        value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} />
                      <div className="sess-actions">
                        <button className="btn btn-primary btn-md" disabled={busy || !input.trim()} onClick={send}>
                          {busy ? <Loader2 size={16} className="spin" /> : <Send size={16} />} Send
                        </button>
                        {SR && (
                          <button className={`btn btn-md ${listening ? 'btn-primary' : 'btn-secondary'}`} onClick={toggleVoice} type="button">
                            {listening ? <MicOff size={16} /> : <Mic size={16} />} {listening ? 'Stop' : 'Speak'}
                          </button>
                        )}
                        <button className="btn btn-ghost btn-sm" disabled={busy || messages.length < 3} onClick={finish}
                          title={canFinish ? '' : 'Answer a couple of questions first'}>
                          <CheckCircle2 size={15} /> Finish &amp; get feedback
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {phase === 'done' && evalResult && <Evaluation evalResult={evalResult} navigate={navigate} />}
          </div>
        </main>
      </div>
    </div>
  )
}

function Evaluation({ evalResult, navigate }) {
  const dims = Object.entries(evalResult.dimensions || {}).sort((a, b) => a[1] - b[1])
  const d = evalResult.delivery
  return (
    <div>
      <div className="done-hero">
        <div className="done-check" style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}><Mic size={28} /></div>
        <div className="sess-kicker">Interview complete</div>
        <h1 className="sess-skill">Your debrief</h1>
        <p className="forge-sub" style={{ margin: '0 auto' }}>
          Scored on what you actually demonstrated — no vanity number.
          {evalResult.emailed_to && evalResult.email_active ? <> A copy is on its way to <strong>{evalResult.emailed_to}</strong>.</> : null}
        </p>
      </div>

      <div className="forge-sec-head"><div className="forge-sec-title">By dimension</div><div className="forge-sec-hint">weakest first</div></div>
      <div className="forge-memory">
        {dims.map(([k, v]) => (
          <div key={k} className="mem-row" style={{ cursor: 'default', gridTemplateColumns: '170px 1fr 48px' }}>
            <div className="mem-name">{DIM_LABELS[k] || k}</div>
            <div className="mem-bar"><i style={{ width: `${v}%`, background: masteryColor(v) }} /></div>
            <div className="mem-pct" style={{ color: masteryColor(v) }}>{v}</div>
          </div>
        ))}
      </div>

      {d && d.enabled && (
        <>
          <div className="forge-sec-head"><div className="forge-sec-title">On-camera presence</div><div className="forge-sec-hint">confidence signal</div></div>
          <div className="done-cols" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="done-pill"><span>Composure</span><span className="mem-pct" style={{ color: masteryColor(d.composure) }}>{d.composure}</span></div>
            <div className="done-pill"><span>Eye contact</span><span className="mem-pct">{d.eye_contact}%</span></div>
            <div className="done-pill"><span>Mostly</span><span style={{ textTransform: 'capitalize' }}>{d.dominant_expression || '—'}</span></div>
          </div>
        </>
      )}

      <div className="done-cols">
        <div className="done-col">
          <h4>Strong</h4>
          {(evalResult.strengths || []).map((s, i) => (
            <div key={i} className="done-pill" style={{ display: 'block' }}><Trophy size={13} style={{ verticalAlign: -2, marginRight: 6, color: 'var(--green)' }} />{s}</div>
          ))}
        </div>
        <div className="done-col">
          <h4>Needs work</h4>
          {(evalResult.gaps || []).map((g, i) => (
            <div key={i} className="done-pill" style={{ display: 'block' }}><Target size={13} style={{ verticalAlign: -2, marginRight: 6, color: 'var(--amber)' }} />{g}</div>
          ))}
        </div>
      </div>

      {evalResult.recommended && <div className="narrative-box"><strong>Recommended next refresh:</strong> {evalResult.recommended}</div>}

      <div className="sess-actions">
        <button className="btn btn-primary btn-md" onClick={() => navigate('/forge')}>Back to Forge</button>
        <button className="btn btn-secondary btn-md" onClick={() => window.location.reload()}>New interview</button>
      </div>
    </div>
  )
}
