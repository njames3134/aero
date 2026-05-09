
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)

  if (hrs > 0) {
    return `${hrs}h ${mins}m`
  }
  return `${mins}m`
}

export function formatMph(ms: number) {
  return `${(ms * 2.23694).toFixed(1)} mph`;
}
