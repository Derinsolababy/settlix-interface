import { describe, expect, it } from 'vitest';
import { formatAmount, splitFee, toStroops } from '@/lib/money';

describe('money', () => {
  it('parses decimal strings to stroops exactly', () => {
    expect(toStroops('25')).toBe(250_000_000n);
    expect(toStroops('0.0000001')).toBe(1n);
    expect(toStroops(' 12.5 ')).toBe(125_000_000n);
  });

  it('rejects anything that is not a plain non-negative decimal', () => {
    for (const bad of ['', '-1', '1e3', '1.12345678', 'abc', '1,000']) {
      expect(() => toStroops(bad), bad).toThrow(/Enter an amount/);
    }
  });

  it('formats with grouping, trimming zeros but keeping two decimals', () => {
    expect(formatAmount(250_000_000n)).toBe('25.00');
    expect(formatAmount(248_750_000n)).toBe('24.875');
    expect(formatAmount(12_345_678_900_000n)).toBe('1,234,567.89');
    expect(formatAmount(1n)).toBe('0.0000001');
    expect(formatAmount(-5_000_000n)).toBe('-0.50');
  });

  it('splits fees like the payment contract', () => {
    expect(splitFee(250_000_000n, 50)).toEqual({ fee: 1_250_000n, net: 248_750_000n });
    expect(splitFee(199n, 50)).toEqual({ fee: 0n, net: 199n });
  });
});
