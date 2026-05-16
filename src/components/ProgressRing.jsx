export default function ProgressRing({ pct = 1, state = 'idle', children }) {
  const r = 108
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.max(0, Math.min(1, pct)))

  const strokeColor =
    state === 'done' ? '#f87171'
    : state === 'paused' ? '#fbbf24'
    : state === 'running' ? '#a78bfa'
    : '#1a1a24'

  return (
    <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
      <svg
        viewBox="0 0 240 240"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle cx="120" cy="120" r={r} fill="none" stroke="#1a1a24" strokeWidth="6" />
        <circle
          cx="120" cy="120" r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
        />
      </svg>
      <div className="relative z-10 text-center">
        {children}
      </div>
    </div>
  )
}
