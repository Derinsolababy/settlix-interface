/** Stellar amounts: bigint stroops, 7 decimals. Never floats. */
export const DECIMALS = 7;
const SCALE = 10n ** BigInt(DECIMALS);

export function toStroops(value: string): bigint {
  const m = /^(\d+)(?:\.(\d{1,7}))?$/.exec(value.trim());
  if (!m) throw new RangeError('Enter an amount like 12.50 (up to 7 decimals).');
  return BigInt(m[1]) * SCALE + BigInt((m[2] ?? '').padEnd(DECIMALS, '0') || '0');
}

/** 248750000n -> "24.875" (trailing zeros trimmed, at least 2 decimals). */
export function formatAmount(stroops: bigint, minDecimals = 2): string {
  const neg = stroops < 0n;
  const abs = neg ? -stroops : stroops;
  let frac = (abs % SCALE).toString().padStart(DECIMALS, '0').replace(/0+$/, '');
  if (frac.length < minDecimals) frac = frac.padEnd(minDecimals, '0');
  const whole = (abs / SCALE).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${neg ? '-' : ''}${whole}${frac ? `.${frac}` : ''}`;
}

/** Same rounding as the payment contract. */
export function splitFee(amount: bigint, bps: number) {
  const fee = (amount * BigInt(bps)) / 10_000n;
  return { fee, net: amount - fee };
}
