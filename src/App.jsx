import { useState, useEffect, useRef, useCallback } from 'react'

// ── helpers ──────────────────────────────────────────────────────────────────
const pad = (n, d = 2) => String(Math.floor(n)).padStart(d, '0')

const formatTime = (ms) => {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

const formatMs = (ms) => '.' + pad(Math.floor((ms % 1000) / 10))

const hasHours = (ms) => ms >= 3600000

function beep() {
  try {
    const ctx = new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.value = 880
    g.gain.setValueAtTime(0.3, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    o.start(); o.stop(ctx.currentTime + 0.8)
  } catch (_) {}
}

// ── Ring SVG ─────────────────────────────────────────────────────────────────
// Grows from 240→280 when hours are present so the larger text fits comfortably
function Ring({ pct = 1, status = 'idle', showHours = false, children }) {
  const size   = showHours ? 280 : 240
  const center = size / 2
  const r      = showHours ? 126 : 108
  const circ   = 2 * Math.PI * r
  const offset = circ * (1 - Math.max(0, Math.min(1, pct)))

  const strokeColor =
    status === 'done'   ? '#f87171' :
    status === 'paused' ? '#fbbf24' : '#a78bfa'

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size, transition: 'width 0.3s, height 0.3s' }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 w-full h-full"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle cx={center} cy={center} r={r} fill="none" stroke="#1a1a24" strokeWidth="6" />
        <circle
          cx={center} cy={center} r={r} fill="none"
          stroke={strokeColor} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          className="ring-fill"
        />
      </svg>
      <div className="z-10 text-center">{children}</div>
    </div>
  )
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
function StatusBadge({ status, label }) {
  const styles = {
    running: { bg: 'rgba(52,211,153,0.12)',  color: '#34d399' },
    paused:  { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
    done:    { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
    idle:    { bg: 'rgba(255,255,255,0.05)', color: '#6b6880' },
  }
  const s = styles[status] || styles.idle
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-1 rounded-full mt-3"
      style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}
    >
      <div
        className={`rounded-full ${status === 'running' ? 'pulse' : ''}`}
        style={{ width: 6, height: 6, background: s.color }}
      />
      {label}
    </div>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = 'primary', wide = false }) {
  const base = {
    fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    border: 'none', cursor: 'pointer', borderRadius: 100,
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: wide ? '14px 52px' : '14px 28px',
    transition: 'all 0.15s',
  }
  const variants = {
    primary:   { background: '#7c3aed', color: '#fff' },
    secondary: { background: '#1a1a24', color: '#6b6880', border: '0.5px solid rgba(255,255,255,0.13)' },
    green:     { background: '#059669', color: '#fff' },
    amber:     { background: '#d97706', color: '#fff' },
  }
  return (
    <button
      style={{ ...base, ...variants[variant] }}
      onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {children}
    </button>
  )
}

// ── STOPWATCH ─────────────────────────────────────────────────────────────────
function Stopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps]       = useState([])
  const startTimeRef = useRef(0)
  const lapStartRef  = useRef(0)
  const rafRef       = useRef(null)
  const elapsedRef   = useRef(0)

  const tick = useCallback(() => {
    const t = Date.now() - startTimeRef.current
    elapsedRef.current = t
    setElapsed(t)
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const start = () => {
    if (running) return
    startTimeRef.current = Date.now() - elapsedRef.current
    if (lapStartRef.current === 0) lapStartRef.current = startTimeRef.current
    setRunning(true)
    rafRef.current = requestAnimationFrame(tick)
  }
  const pause = () => { setRunning(false); cancelAnimationFrame(rafRef.current) }
  const reset = () => {
    setRunning(false); cancelAnimationFrame(rafRef.current)
    elapsedRef.current = 0; lapStartRef.current = 0
    setElapsed(0); setLaps([])
  }
  const lap = () => {
    if (!running) return
    const now = Date.now()
    const total   = now - startTimeRef.current
    const lapTime = now - lapStartRef.current
    lapStartRef.current = now
    setLaps(prev => [...prev, { num: prev.length + 1, total, lapTime }])
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const status      = running ? 'running' : elapsed > 0 ? 'paused' : 'idle'
  const statusLabel = running ? 'Running'  : elapsed > 0 ? 'Paused'  : 'Ready'
  const lapTimes    = laps.map(l => l.lapTime)
  const minT        = lapTimes.length > 1 ? Math.min(...lapTimes) : null
  const maxT        = lapTimes.length > 1 ? Math.max(...lapTimes) : null
  const showHours   = hasHours(elapsed)
  // Font scales: MM:SS → 3rem, HH:MM:SS → 2rem
  const timeFontSize = showHours ? '2rem' : '3rem'

  return (
    <div>
      <div className="flex flex-col items-center mb-8">
        <Ring pct={1} status={status} showHours={showHours}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: timeFontSize, fontWeight: 300, lineHeight: 1, color: '#f0eef8', transition: 'font-size 0.3s' }}>
            {formatTime(elapsed)}
          </div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '1rem', fontWeight: 300, color: '#6b6880', marginTop: 4 }}>
            {formatMs(elapsed)}
          </div>
        </Ring>
        <StatusBadge status={status} label={statusLabel} />
      </div>

      <div className="flex justify-center gap-4 mb-6">
        {running ? (
          <><Btn variant="secondary" onClick={lap}>Lap</Btn><Btn variant="amber" onClick={pause}>⏸ Pause</Btn></>
        ) : elapsed > 0 ? (
          <><Btn variant="secondary" onClick={reset}>Reset</Btn><Btn variant="green" onClick={start}>▶ Resume</Btn></>
        ) : (
          <Btn variant="primary" onClick={start} wide>▶ Start</Btn>
        )}
      </div>

      {laps.length > 0 && (
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem' }}>
          <div className="flex justify-between items-center mb-3">
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b6880' }}>Laps</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '3px 10px', borderRadius: 100 }}>{laps.length}</span>
          </div>
          <div className="laps-list" style={{ maxHeight: 200, overflowY: 'auto' }}>
            {[...laps].reverse().map(l => {
              const isFastest = l.lapTime === minT
              const isSlowest = l.lapTime === maxT
              return (
                <div key={l.num} className="flex justify-between items-center py-2"
                  style={{ borderBottom: '0.5px solid rgba(255,255,255,0.07)', fontSize: 13 }}>
                  <span style={{ color: '#6b6880', fontWeight: 600, minWidth: 32 }}>#{l.num}</span>
                  <span style={{ fontFamily: "'DM Mono',monospace", color: isFastest ? '#34d399' : isSlowest ? '#f87171' : '#f0eef8' }}>
                    {formatTime(l.lapTime)}{formatMs(l.lapTime)}
                  </span>
                  <span style={{ fontSize: 11, color: isFastest ? '#34d399' : isSlowest ? '#f87171' : '#6b6880' }}>
                    {isFastest ? '🏆 fastest' : isSlowest ? '🐢 slowest' : ''}
                  </span>
                  <span style={{ fontFamily: "'DM Mono',monospace", color: '#6b6880', fontSize: 12 }}>
                    {formatTime(l.total)}{formatMs(l.total)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── TIMER ─────────────────────────────────────────────────────────────────────
function Timer() {
  const [hours,   setHours]   = useState(0)
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [initial,   setInitial]   = useState(0)
  const [running,   setRunning]   = useState(false)
  const [done,      setDone]      = useState(false)
  const startTimeRef = useRef(0)
  const remainingRef = useRef(0)
  const rafRef       = useRef(null)

  const tick = useCallback(() => {
    const left = remainingRef.current - (Date.now() - startTimeRef.current)
    if (left <= 0) {
      setRemaining(0); setRunning(false); setDone(true); beep(); return
    }
    setRemaining(left)
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const start = () => {
    if (running) return
    const total = (done || remaining === 0)
      ? (hours * 3600 + minutes * 60 + seconds) * 1000
      : remaining
    if (total <= 0) return
    remainingRef.current = total
    startTimeRef.current = Date.now()
    setInitial(remaining > 0 && !done ? initial : total)
    setRunning(true); setDone(false)
    rafRef.current = requestAnimationFrame(tick)
  }
  const pause = () => {
    const left = remainingRef.current - (Date.now() - startTimeRef.current)
    remainingRef.current = left
    setRemaining(left); setRunning(false)
    cancelAnimationFrame(rafRef.current)
  }
  const reset = () => {
    setRunning(false); setDone(false)
    cancelAnimationFrame(rafRef.current)
    remainingRef.current = 0
    setRemaining(0); setInitial(0)
  }
  const applyPreset = (secs) => {
    reset()
    setHours(Math.floor(secs / 3600))
    setMinutes(Math.floor((secs % 3600) / 60))
    setSeconds(secs % 60)
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const editable    = !running && !done && remaining === 0
  const displayTime = done ? 0 : (running || remaining > 0) ? remaining : (hours * 3600 + minutes * 60 + seconds) * 1000
  const pct         = initial > 0 ? displayTime / initial : 1
  const status      = done ? 'done' : running ? 'running' : remaining > 0 ? 'paused' : 'idle'
  const statusLabel = done ? "Time's up!" : running ? 'Counting down' : remaining > 0 ? 'Paused' : 'Set time'

  // Determine if we need hours display — based on the current displayTime
  const showHours    = hasHours(displayTime)
  // Also check if the input would produce hours (for the editable state)
  const inputHours   = hours > 0
  const ringShowHours = showHours || (editable && inputHours)

  // Font size: shrink when HH:MM:SS is shown
  const timeFontSize = ringShowHours ? '2rem' : '3rem'

  const PRESETS = [
    { label: '1 min',  secs: 60 },
    { label: '5 min',  secs: 300 },
    { label: '10 min', secs: 600 },
    { label: '20 min', secs: 1200 },
    { label: '30 min', secs: 1800 },
    { label: '1 hr',   secs: 3600 },
  ]

  return (
    <div>
      <div className="flex flex-col items-center mb-8">
        <Ring pct={pct} status={status} showHours={ringShowHours}>
          <div style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: timeFontSize,
            fontWeight: 300, lineHeight: 1, color: '#f0eef8',
            transition: 'font-size 0.3s',
            letterSpacing: ringShowHours ? '-0.02em' : '0',
          }}>
            {formatTime(displayTime)}
          </div>
          {!done && (
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '1rem', fontWeight: 300, color: '#6b6880', marginTop: 4 }}>
              {formatMs(displayTime)}
            </div>
          )}
        </Ring>
        <StatusBadge status={status} label={statusLabel} />
      </div>

      {done && (
        <div className="text-center rounded-xl mb-5 py-3 px-4"
          style={{ background: 'rgba(248,113,113,0.1)', border: '0.5px solid rgba(248,113,113,0.25)', color: '#f87171', fontSize: 14, fontWeight: 600, letterSpacing: '0.05em' }}>
          ⏰ Timer complete!
        </div>
      )}

      {editable && (
        <>
          <div className="mb-5">
            <span style={{ display: 'block', marginBottom: 10, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b6880' }}>
              Set duration
            </span>
            <div className="flex items-center gap-1">
              {[
                { label: 'Hours',   value: hours,   set: setHours,   max: 23 },
                { label: 'Minutes', value: minutes, set: setMinutes, max: 59 },
                { label: 'Seconds', value: seconds, set: setSeconds, max: 59 },
              ].map((f, i) => (
                <div key={f.label} className="flex items-center gap-1 flex-1">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <label style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6880', fontWeight: 600 }}>
                      {f.label}
                    </label>
                    <input
                      type="number" min="0" max={f.max} value={pad(f.value)}
                      onChange={e => f.set(Math.min(f.max, Math.max(0, parseInt(e.target.value) || 0)))}
                      style={{
                        width: '100%', textAlign: 'center', padding: '14px 8px',
                        fontFamily: "'DM Mono',monospace", fontSize: '2rem', fontWeight: 300,
                        background: '#1a1a24', border: '0.5px solid rgba(255,255,255,0.13)',
                        borderRadius: 12, color: '#f0eef8', outline: 'none',
                      }}
                    />
                  </div>
                  {i < 2 && (
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '2rem', fontWeight: 300, color: '#6b6880', paddingTop: 22 }}>:</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => applyPreset(p.secs)}
                style={{
                  fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: '#1a1a24', border: '0.5px solid rgba(255,255,255,0.13)',
                  borderRadius: 100, color: '#6b6880', padding: '7px 16px', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.target.style.color='#a78bfa'; e.target.style.borderColor='#a78bfa' }}
                onMouseLeave={e => { e.target.style.color='#6b6880'; e.target.style.borderColor='rgba(255,255,255,0.13)' }}
              >{p.label}</button>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-center gap-4">
        {done ? (
          <Btn variant="primary" onClick={reset} wide>↺ Reset</Btn>
        ) : running ? (
          <><Btn variant="secondary" onClick={reset}>Reset</Btn><Btn variant="amber" onClick={pause}>⏸ Pause</Btn></>
        ) : remaining > 0 ? (
          <><Btn variant="secondary" onClick={reset}>Reset</Btn><Btn variant="green" onClick={start}>▶ Resume</Btn></>
        ) : (
          <Btn variant="primary" onClick={start} wide>▶ Start</Btn>
        )}
      </div>
    </div>
  )
}

// ── App Shell ─────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState('stopwatch')

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10" style={{ background: '#0a0a0f', fontFamily: 'Syne, sans-serif' }}>
      <div className="w-full flex items-center justify-between mb-8" style={{ maxWidth: 540 }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#a78bfa' }}>
          Chrono
        </span>
        <div className="flex p-1 gap-1 rounded-full" style={{ background: '#111118', border: '0.5px solid rgba(255,255,255,0.13)' }}>
          {['stopwatch', 'timer'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 11,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              background: mode === m ? '#7c3aed' : 'none',
              color: mode === m ? '#fff' : '#6b6880',
              border: 'none', padding: '6px 18px', borderRadius: 100, cursor: 'pointer', transition: 'all 0.2s',
            }}>{m}</button>
          ))}
        </div>
      </div>

      <div className="w-full relative overflow-hidden" style={{
        maxWidth: 540, background: '#111118',
        border: '0.5px solid rgba(255,255,255,0.13)',
        borderRadius: 24, padding: '2.5rem 2rem',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 200, height: 200,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {mode === 'stopwatch' ? <Stopwatch /> : <Timer />}
      </div>

      <p style={{ marginTop: '2rem', fontSize: 11, color: '#2a2838', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Precision time tracking
      </p>
    </div>
  )
}