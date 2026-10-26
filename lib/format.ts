// "in 12 min" / "3 min ago". `now` is passed in so components that tick
// (see useNow) re-render with fresh values.
export function formatRelative(value: string | number | Date, now: number = Date.now()): string {
  const diff = new Date(value).getTime() - now;
  const future = diff > 0;
  const seconds = Math.round(Math.abs(diff) / 1000);

  if (seconds < 60) return future ? "in under a minute" : "just now";

  const minutes = Math.floor(seconds / 60);
  let unit: string;
  if (minutes < 60) unit = `${minutes} min`;
  else if (minutes < 60 * 24) unit = `${Math.floor(minutes / 60)} hr`;
  else unit = `${Math.floor(minutes / (60 * 24))} d`;

  return future ? `in ${unit}` : `${unit} ago`;
}

export function formatExactTime(value: string | number | Date): string {
  return new Date(value).toLocaleString();
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}