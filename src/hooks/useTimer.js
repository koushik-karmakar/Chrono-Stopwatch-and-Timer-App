import { useState, useRef, useCallback } from 'react'

export function useTimer() {
  const [remaining, setRemaining] = useState(0)
  const [initial, setInitial] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  const startTimeRef = useRef(0)
  const remainingRef = useRef(0)
  const rafRef = useRef(null)

  const beep = useCallback(() => {
    try {
      const ctx = new AudioContext()
      const freqs = [880, 1108, 1320]
      freqs.forEach((freq, i) => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.connect(g)
        g.connect(ctx.destination)
        o.frequency.value = freq
        const t = ctx.currentTime + i * 0.18
        g.gain.setValueAtTime(0.25, t)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
        o.start(t)
        o.stop(t + 0.5)
      })
    } catch (_) {}
  }, [])

  const tick = useCallback(() => {
    const left = remainingRef.current - (Date.now() - startTimeRef.current)
    if (left <= 0) {
      cancelAnimationFrame(rafRef.current)
      setRemaining(0)
      remainingRef.current = 0
      setRunning(false)
      setDone(true)
      beep()
      return
    }
    setRemaining(left)
    rafRef.current = requestAnimationFrame(tick)
  }, [beep])

  const start = useCallback((ms) => {
    const total = ms ?? remainingRef.current
    if (total <= 0) return
    setInitial(prev => ms != null ? total : prev)
    remainingRef.current = total
    startTimeRef.current = Date.now()
    setRunning(true)
    setDone(false)
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const pause = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    const left = remainingRef.current - (Date.now() - startTimeRef.current)
    remainingRef.current = Math.max(0, left)
    setRemaining(remainingRef.current)
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setRunning(false)
    setDone(false)
    setRemaining(0)
    setInitial(0)
    remainingRef.current = 0
  }, [])

  const setTime = useCallback((ms) => {
    remainingRef.current = ms
    setRemaining(ms)
    setInitial(ms)
    setDone(false)
  }, [])

  return { remaining, initial, running, done, start, pause, reset, setTime }
}
