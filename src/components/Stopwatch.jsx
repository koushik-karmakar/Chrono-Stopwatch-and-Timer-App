import ProgressRing from './ProgressRing'
import StatusBadge from './StatusBadge'
import { useStopwatch } from '../hooks/useStopwatch'
import { formatTime, formatMs, formatLapTime } from '../utils/time'

export default function Stopwatch() {
  const { elapsed, running, laps, start, pause, reset, lap } = useStopwatch()

  const lapTimes = laps.map(l => l.lapTime)
  const minLap = lapTimes.length > 1 ? Math.min(...lapTimes) : null
  const maxLap = lapTimes.length > 1 ? Math.max(...lapTimes) : null

  const state = running ? 'running' : elapsed > 0 ? 'paused' : 'stopped'
  const statusLabel = running ? 'Running' : elapsed > 0 ? 'Paused' : 'Ready'

  return (
    <div>

      <div className="flex flex-col items-center mb-8">
        <ProgressRing pct={1} state={state}>
          <div
            className="font-mono font-light leading-none"
            style={{ fontSize: '3rem', letterSpacing: '-0.02em' }}
          >
            {formatTime(elapsed)}
          </div>
          <div className="font-mono font-light text-[#6b6880] mt-1" style={{ fontSize: '1.1rem' }}>
            {formatMs(elapsed)}
          </div>
        </ProgressRing>
        <div className="mt-4">
          <StatusBadge state={state} label={statusLabel} />
        </div>
      </div>

  
      <div className="flex items-center justify-center gap-3 mb-8">
        {running ? (
          <>
            <button className="btn-secondary" onClick={lap}>Lap</button>
            <button className="btn-primary amber" onClick={pause}>⏸ Pause</button>
          </>
        ) : elapsed > 0 ? (
          <>
            <button className="btn-secondary" onClick={reset}>↺ Reset</button>
            <button className="btn-primary green" onClick={start}>▶ Resume</button>
          </>
        ) : (
          <button className="btn-primary purple" style={{ padding: '14px 56px' }} onClick={start}>▶ Start</button>
        )}
      </div>

   
      {laps.length > 0 && (
        <div className="border-t border-white/5 pt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[0.65rem] font-bold tracking-widest uppercase text-[#6b6880]">Laps</span>
            <span className="text-[0.65rem] font-bold text-[#a78bfa] bg-purple-500/10 px-3 py-1 rounded-full">
              {laps.length}
            </span>
          </div>
          <div className="space-y-0 max-h-48 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            {[...laps].reverse().map(l => {
              const isFastest = l.lapTime === minLap
              const isSlowest = l.lapTime === maxLap
              return (
                <div
                  key={l.num}
                  className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
                >
                  <span className="text-[0.7rem] font-bold text-[#6b6880] w-8">#{l.num}</span>
                  <span
                    className={`font-mono text-sm ${isFastest ? 'text-emerald-400' : isSlowest ? 'text-red-400' : 'text-[#f0eef8]'}`}
                  >
                    {formatLapTime(l.lapTime)}
                  </span>
                  <span className="text-[0.7rem] text-[#6b6880] w-20 text-right">
                    {isFastest ? '🏆 fastest' : isSlowest ? '🐢 slowest' : ''}
                  </span>
                  <span className="font-mono text-xs text-[#6b6880]">
                    {formatLapTime(l.total)}
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
