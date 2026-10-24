'use client';

import { useState } from 'react';
import { Notice, Row } from '@/components/ui';
import { config, tokenByCode } from '@/lib/config';
import { explain, type Invoice } from '@/lib/contracts';
import { newReference } from '@/lib/format';
import { formatAmount, splitFee, toStroops } from '@/lib/money';
import { fetchQuote, type Quote } from '@/lib/oracle';
import { rememberInvoice } from '@/lib/recent';
import { settlix } from '@/lib/settlix';
import { useWallet } from '@/lib/wallet';

const EXPIRIES = [
  ['15 minutes', 15 * 60],
  ['1 hour', 60 * 60],
  ['24 hours', 24 * 60 * 60],
] as const;

export function NewInvoiceForm({ feeBps, onCreated }: { feeBps: number; onCreated: (inv: Invoice) => void }) {
  const { address, signer } = useWallet();
  const [asset, setAsset] = useState<'XLM' | 'USDC'>('XLM');
  const [priceIn, setPriceIn] = useState<'USD' | 'asset'>('USD');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState(() => newReference());
  const [expiry, setExpiry] = useState<number>(EXPIRIES[1][1]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  let preview: bigint | null = null;
  try {
    preview = priceIn === 'asset' && amount ? toStroops(amount) : null;
  } catch {
    preview = null;
  }
  const split = preview !== null ? splitFee(preview, feeBps) : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;
    setError(null);
    try {
      let units: bigint;
      if (priceIn === 'USD') {
        setBusy('Getting a price...');
        const q = await fetchQuote(asset, amount.trim());
        setQuote(q);
        units = toStroops(q.amount);
      } else {
        units = toStroops(amount);
      }
      if (units <= 0n) throw new Error('The amount must be greater than zero.');
      setBusy('Confirm in your wallet...');
      const token = tokenByCode(asset)!.contractId;
      const expiresAt = new Date(Date.now() + expiry * 1000);
      const { id } = await settlix.createInvoice(address, signer, { token, amount: units, reference: reference.trim(), expiresAt });
      rememberInvoice(address, id);
      const inv = await settlix.invoice(id);
      if (inv) onCreated(inv);
      setAmount('');
      setReference(newReference());
    } catch (err) {
      setError(explain(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <fieldset>
          <legend className="label">Customer pays in</legend>
          <div className="flex overflow-hidden rounded-md border border-rule">
            {config.tokens.map((t) => (
              <button
                type="button"
                key={t.code}
                onClick={() => setAsset(t.code)}
                className={`flex-1 py-2.5 text-sm font-semibold ${asset === t.code ? 'bg-ink text-card' : 'bg-card hover:bg-paper'}`}
                aria-pressed={asset === t.code}
              >
                {t.code}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="block">
          <span className="label">Price in</span>
          <select className="field" value={priceIn} onChange={(e) => setPriceIn(e.target.value as 'USD' | 'asset')}>
            <option value="USD">US dollars</option>
            <option value="asset">{asset}</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="label">Amount</span>
        <div className="relative">
          <input
            className="field pr-16 font-mono text-2xl"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            pattern="\d+(\.\d{1,7})?"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">{priceIn === 'USD' ? 'USD' : asset}</span>
        </div>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="label">Reference</span>
          <input className="field font-mono" value={reference} onChange={(e) => setReference(e.target.value)} maxLength={64} required />
        </label>
        <label className="block">
          <span className="label">Expires after</span>
          <select className="field" value={expiry} onChange={(e) => setExpiry(Number(e.target.value))}>
            {EXPIRIES.map(([label, secs]) => (
              <option key={secs} value={secs}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      {priceIn === 'USD' && (
        <p className="text-xs text-muted">
          The amount is converted at a signed oracle quote when you create the invoice; the customer pays exactly that.
        </p>
      )}
      {split && (
        <div className="rounded-md border border-dashed border-ink/25 px-4 py-2">
          <Row label="Customer pays">{formatAmount(preview!)} {asset}</Row>
          <Row label="You receive">{formatAmount(split.net)} {asset}</Row>
        </div>
      )}
      {quote && (
        <p className="font-mono text-xs text-muted">
          Last quote: {quote.fiatAmount} USD at {quote.price} = {quote.amount} {quote.asset.code}
        </p>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      <button className="btn-accent w-full py-3 text-base" disabled={!!busy}>
        {busy ?? 'Create invoice'}
      </button>
    </form>
  );
}
