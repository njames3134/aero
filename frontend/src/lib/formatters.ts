
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}h ${mins}m`
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatMph(ms: number) {
  return `${(ms * 2.23694).toFixed(1)} mph`;
}

export function formatPace(mph: number): string {
  if (!mph || mph <= 0) return "--";
  const minPerMile = 60 / mph;
  const mins = Math.floor(minPerMile);
  const secs = Math.round((minPerMile - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")} /mi`;
}

export function formatSwimPace(mps: number): string {
  if (!mps || mps <= 0) return "--";
  const metersPerSecond = mps;
  const secondsPer100m = 100 / metersPerSecond;
  const secondsPer100yd = secondsPer100m * (91.44 / 100);
  const mins = Math.floor(secondsPer100yd / 60);
  const secs = Math.round(secondsPer100yd % 60);
  return `${mins}:${secs.toString().padStart(2, "0")} /100yd`;
}
