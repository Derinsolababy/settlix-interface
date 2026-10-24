'use client';

import { useState } from 'react';
import { Notice } from '@/components/ui';
import { explain } from '@/lib/contracts';
import { sha256Hex } from '@/lib/format';
import { settlix } from '@/lib/settlix';
import { useWallet } from '@/lib/wallet';

export function ApplyForm({ onDone }: { onDone: () => void }) {
  const { address, signer } = useWallet();
  const [name, setName] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [payout, setPayout] = useState(address ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;
    setBusy(true);
    setError(null);
    try {
      // Only the hash goes on-chain; the registration number never leaves this browser.
      const businessHash = await sha256Hex(businessId.trim().toUpperCase());
      await settlix.apply(address, signer, { name: name.trim(), businessHash, settlementAddress: payout.trim() });
      onDone();
    } catch (err) {
      setError(explain(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-lg space-y-5">
      <div>
        <p className="eyebrow">Step 1 of 2</p>
        <h1 className="mt-2 font-display text-4xl">Apply as a merchant</h1>
        <p className="mt-2 text-muted">The platform reviews applications before a merchant can issue invoices.</p>
      </div>
      <label className="block">
        <span className="label">Business name</span>
        <input className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={64} required placeholder="Ada Fabrics" />
      </label>
      <label className="block">
        <span className="label">Business registration number</span>
        <input className="field font-mono" value={businessId} onChange={(e) => setBusinessId(e.target.value)} required placeholder="RC-123456" />
        <span className="mt-1.5 block text-xs text-muted">Hashed with SHA-256 in your browser. Only the hash is stored on-chain.</span>
      </label>
      <label className="block">
        <span className="label">Payout address</span>
        <input className="field font-mono text-xs" value={payout} onChange={(e) => setPayout(e.target.value)} required pattern="G[A-Z2-7]{55}" />
        <span className="mt-1.5 block text-xs text-muted">Where customer payments arrive. Defaults to this wallet; another address must co-sign.</span>
      </label>
      {error && <Notice tone="error">{error}</Notice>}
      <button className="btn-primary w-full py-3" disabled={busy}>
        {busy ? 'Waiting for wallet and network...' : 'Sign and submit application'}
      </button>
    </form>
  );
}
