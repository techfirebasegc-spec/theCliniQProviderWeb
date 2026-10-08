export const authEmailCooldownMilliseconds = 60_000;

export function nextAuthEmailCooldown(now: number = Date.now()): number {
  return now + authEmailCooldownMilliseconds;
}

export function authEmailCooldownActive(until: number, now: number = Date.now()): boolean {
  return until > now;
}
