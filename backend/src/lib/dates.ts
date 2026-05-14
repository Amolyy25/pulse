export function startOfUtcDay(d: Date = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + days);
  return r;
}

export function diffDays(a: Date, b: Date): number {
  const ms = startOfUtcDay(a).getTime() - startOfUtcDay(b).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

export function isoDate(d: Date): string {
  return startOfUtcDay(d).toISOString().slice(0, 10);
}
