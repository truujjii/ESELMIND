/** Format a duration in seconds as m:ss (e.g. 240 → "4:00"). */
export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${`${s}`.padStart(2, '0')}`;
}
