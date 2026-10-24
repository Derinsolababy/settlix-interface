import { describe, expect, it } from 'vitest';
import { ContractError, explain, parseInvoice, parseMerchant } from '@/lib/contracts';

// Shapes as scValToNative returns them for the deployed contracts.
const rawInvoice = {
  id: 1n,
  merchant: 'GCDYRPYLZPJWSVV4D2BFUONSXS6526K2ZALVAM6WBISPT47ELTERLXKO',
  token: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  amount: 250_000_000n,
  reference: 'ORDER-1001',
  status: ['Paid'],
  expires_at: 1_792_833_300n,
  created_at: 1_792_829_707n,
  customer: 'GAQN3AIY2HIO3M5PTRQBX6YAQQLSFYYS7MMUKHOMUHI2UXAS7QNF5ZOK',
  payee: 'GCJFBATLJXSMKHFKHAW6WD52YKLL5ZPCEQE63XS2TOQXRDOUZ26WXKMX',
  fee: 1_250_000n,
  refunded: 0n,
  paid_at: 1_792_829_717n,
};

describe('contract decoding', () => {
  it('decodes an invoice', () => {
    const inv = parseInvoice(rawInvoice);
    expect(inv).toMatchObject({ id: 1, amount: 250_000_000n, status: 'Paid', fee: 1_250_000n });
    expect(inv.createdAt.toISOString()).toBe('2026-10-24T08:15:07.000Z');
    expect(inv.paidAt?.toISOString()).toBe('2026-10-24T08:15:17.000Z');
  });

  it('treats an unpaid invoice as having no payment fields', () => {
    const inv = parseInvoice({ ...rawInvoice, status: ['Open'], customer: undefined, payee: undefined, paid_at: 0n });
    expect(inv).toMatchObject({ status: 'Open', customer: null, payee: null, paidAt: null });
  });

  it('decodes a merchant, hex-encoding the business hash', () => {
    const m = parseMerchant({
      address: 'G1', name: 'Ada Fabrics', business_hash: new Uint8Array(32).fill(0xab), settlement_address: 'G2',
      status: ['Pending'], registered_at: 0n,
    });
    expect(m).toMatchObject({ name: 'Ada Fabrics', status: 'Pending', businessHash: 'ab'.repeat(32) });
  });
});

describe('explain', () => {
  it('turns contract error codes into sentences', () => {
    expect(explain(new ContractError('payment.pay_invoice', 10))).toBe('This invoice is no longer open.');
    expect(explain(new ContractError('payment.create_invoice', 6))).toMatch(/already used this reference/);
    expect(explain(new ContractError('registry.apply', 3))).toBe('This wallet has already applied.');
    expect(explain(new ContractError('payment.x', 99))).toMatch(/#99/);
  });

  it('recognises wallet rejections and balance failures', () => {
    expect(explain(new Error('User declined access'))).toMatch(/declined/);
    expect(explain(new Error('resulting balance is not within the allowed range'))).toMatch(/Not enough balance/);
  });
});
