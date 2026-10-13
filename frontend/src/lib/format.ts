// The API sends LocalDateTime without time zone ("2026-09-11T10:20:00");
// `new Date()` reads that format as local time, which is what we want.

function parse(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(iso: string): string {
  const date = parse(iso);
  if (!date) return iso;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function formatTime(iso: string): string {
  const date = parse(iso);
  if (!date) return iso;
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

/** "1h 30min", "45min", or null when the meeting has no end. */
export function formatDuration(startIso: string, endIso: string | null): string | null {
  if (!endIso) return null;
  const start = parse(startIso);
  const end = parse(endIso);
  if (!start || !end) return null;
  const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

export function formatScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(1).replace(".", ",");
}
