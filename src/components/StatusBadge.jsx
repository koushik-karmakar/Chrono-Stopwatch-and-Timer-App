export default function StatusBadge({ state, label }) {
  const styles = {
    running:  'bg-emerald-500/10 text-emerald-400',
    paused:   'bg-amber-500/10 text-amber-400',
    stopped:  'bg-white/5 text-[#6b6880]',
    done:     'bg-red-500/10 text-red-400',
  }

  return (
    <div className={`inline-flex items-center gap-2 text-[0.65rem] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full ${styles[state] ?? styles.stopped}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full bg-current ${state === 'running' ? 'animate-pulse-dot' : ''}`}
      />
      {label}
    </div>
  )
}
