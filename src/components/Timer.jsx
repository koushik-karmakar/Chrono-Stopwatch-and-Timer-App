import { useState } from 'react'
import ProgressRing from './ProgressRing'
import StatusBadge from './StatusBadge'
import { useTimer } from '../hooks/useTimer'
import { formatTime, formatMs, pad } from '../utils/time'

const PRESETS = [
  { label: '1 min', s: 60 },
  { label: '5 min', s: 300 },
  { label: '10 min', s: 600 },
  { label: '20 min', s: 1200 },
  { label: '30 min', s: 1800 },
  { label: '1 hr', s: 3600 },
]

export default function Timer() {
  const { remaining, initial, running, done, start, pause, reset, setTime } = useTimer()

  const [inputH, setInputH] = useState(0)
  const [inputM, setInputM] = useState(5)
  const [inputS, setInputS] = useState(0)

  const isIdle = !running && !done && remaining === 0

  const pct = initial > 0 ? remaining / initial : 1
  const state = done ? 'done' : running ? 'running' : remaining > 0 ? 'paused' : 'stopped'
  const statusLabel = done ? "Time's up!" : running ? 'Counting down' : remaining > 0 ? 'Paused' : 'Set time'

  const displayMs = done ? 0 : (running || remaining > 0) ? remaining : (inputH * 3600 + inputM * 60 + inputS) * 1000

  function handleStart() {
    if (done) { reset(); return }
    if (remaining > 0) { start(); return }
    const ms = (inputH * 3600 + inputM * 60 + inputS) * 1000
    if (ms <= 0) return
    setTime(ms)
    start(ms)
  }

  function handlePreset(s) {
    reset()
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    setInputH(h); setInputM(m); setInputS(sec)
    const ms = s * 1000
    setTime(ms)
  }

  return (
    <div>
      {/* Clock */}
      <div className="flex flex-col items-center mb-6">
        <ProgressRing pct={pct} state={state}>
          <div
            className="font-mono font-light leading-none"
            style={{ fontSize: '3rem', letterSpacing: '-0.02em' }}
          >
            {formatTime(displayMs)}
          </div>
          <div className="font-mono font-light text-[#6b6880] mt-1" style={{ fontSize: '1.1rem' }}>
            {done ? '' : formatMs(displayMs)}
          </div>
        </ProgressRing>
        <div className="mt-4">
          <StatusBadge state={state} label={statusLabel} />
        </div>
      </div>

      {/* Done Banner */}
      {done && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center text-sm font-bold text-red-400 tracking-wide mb-5">
          ⏰ Timer complete!
        </div>
      )}

      {/* Time Input — only when idle */}
      {isIdle && (
        <div className="mb-5">
          <span className="block text-[0.65rem] font-bold tracking-widest uppercase text-[#6b6880] mb-3">
            Set Duration
          </span>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <label className="text-[0.6rem] font-bold tracking-widest uppercase text-[#6b6880]">Hours</label>
              <input
                className="time-input"
                type="number" min="0" max="23"
                value={pad(inputH)}
                onChange={e => setInputH(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
              />
            </div>
            <span className="font-mono text-3xl font-light text-[#6b6880] pt-6">:</span>
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <label className="text-[0.6rem] font-bold tracking-widest uppercase text-[#6b6880]">Minutes</label>
              <input
                className="time-input"
                type="number" min="0" max="59"
                value={pad(inputM)}
                onChange={e => setInputM(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
              />
            </div>
            <span className="font-mono text-3xl font-light text-[#6b6880] pt-6">:</span>
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <label className="text-[0.6rem] font-bold tracking-widest uppercase text-[#6b6880]">Seconds</label>
              <input
                className="time-input"
                type="number" min="0" max="59"
                value={pad(inputS)}
                onChange={e => setInputS(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Presets */}
      {isIdle && (
        <div className="flex flex-wrap gap-2 mb-6">
          {PRESETS.map(p => (
            <button key={p.s} className="preset-btn" onClick={() => handlePreset(p.s)}>
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {done ? (
          <button className="btn-primary purple" style={{ padding: '14px 48px' }} onClick={reset}>↺ Reset</button>
        ) : running ? (
          <>
            <button className="btn-secondary" onClick={reset}>↺ Reset</button>
            <button className="btn-primary amber" onClick={pause}>⏸ Pause</button>
          </>
        ) : remaining > 0 ? (
          <>
            <button className="btn-secondary" onClick={reset}>↺ Reset</button>
            <button className="btn-primary green" onClick={handleStart}>▶ Resume</button>
          </>
        ) : (
          <button className="btn-primary purple" style={{ padding: '14px 56px' }} onClick={handleStart}>▶ Start</button>
        )}
      </div>
    </div>
  )
}
