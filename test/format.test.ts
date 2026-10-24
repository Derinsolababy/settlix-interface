import { describe, expect, it } from 'vitest';
import { newReference, relativeTime, sha256Hex, shortAddress } from '@/lib/format';

describe('format', () => {
  it('shortens addresses', () => {
    expect(shortAddress('GCJFBATLJXSMKHFKHAW6WD52YKLL5ZPCEQE63XS2TOQXRDOUZ26WXKMX')).toBe('GCJF...XKMX');
    expect(shortAddress('GABC')).toBe('GABC');
  });

  it('describes times relative to now', () => {
    const now = new Date('2026-10-24T12:00:00Z');
    expect(relativeTime(new Date('2026-10-24T12:15:00Z'), now)).toBe('in 15 minutes');
    expect(relativeTime(new Date('2026-10-24T11:00:00Z'), now)).toBe('1 hour ago');
    expect(relativeTime(new Date('2026-10-24T12:00:01Z'), now)).toBe('in 1 second');
  });

  it('makes references that fit the contract limit', () => {
    expect(newReference(1_792_829_707_000)).toMatch(/^INV-[0-9A-Z]+$/);
    expect(newReference().length).toBeLessThanOrEqual(64);
  });

  it('hashes business IDs the same way as `shasum -a 256`', async () => {
    // printf 'RC-123456' | shasum -a 256
    expect(await sha256Hex('RC-123456')).toBe('6b11bfc8339a74f3bc04339069cf023ba5e195c3bdf45fc020824bd6a9948798');
  });
});
