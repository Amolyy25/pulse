export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

export function xpToNextLevel(xp: number): { current: number; next: number; progress: number } {
  const level = levelFromXp(xp);
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const progress = next === current ? 1 : (xp - current) / (next - current);
  return { current, next, progress };
}
