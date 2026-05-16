export function pad(n, d = 2) {
  return String(Math.floor(n)).padStart(d, "0");
}

export function formatTime(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

export function formatMs(ms) {
  return "." + pad(Math.floor((ms % 1000) / 10));
}

export function formatLapTime(ms) {
  return formatTime(ms) + formatMs(ms);
}
