export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export function xpProgress(xp: number): {
  level: number;
  current: number;
  next: number;
  progress: number;
  into: number;
  span: number;
} {
  const level = levelFromXp(xp);
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const span = next - current;
  const into = xp - current;
  const progress = span === 0 ? 1 : into / span;
  return { level, current, next, progress, into, span };
}
