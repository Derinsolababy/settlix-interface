export const shortAddress = (a: string, n = 4) => (a.length > 2 * n + 3 ? `${a.slice(0, n)}...${a.slice(-n)}` : a);

export function relativeTime(target: Date, now = new Date()): string {
  const s = Math.round((target.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(s);
  const [value, unit] =
    abs < 60 ? [abs, 'second'] : abs < 3600 ? [Math.round(abs / 60), 'minute'] : abs < 86400 ? [Math.round(abs / 3600), 'hour'] : [Math.round(abs / 86400), 'day'];
  const label = `${value} ${unit}${value === 1 ? '' : 's'}`;
  return s >= 0 ? `in ${label}` : `${label} ago`;
}

export function newReference(now = Date.now()): string {
  return `INV-${now.toString(36).toUpperCase()}`;
}

export async function sha256Hex(text: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
