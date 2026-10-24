'use client';

import { useState } from 'react';
import { WalletGate } from '@/components/ConnectButton';
import { Card, Notice, Row } from '@/components/ui';
import { explain, type Merchant } from '@/lib/contracts';
import { shortAddress } from '@/lib/format';
import { settlix } from '@/lib/settlix';
import { useWallet } from '@/lib/wallet';

export default function AdminPage() {
  return (
    <WalletGate purpose="Approving merchants needs the registry admin's wallet. The contract rejects anyone else.">
      <Approvals />
    </WalletGate>
  );
}

function Approvals() {
  const { address, signer } = useWallet();
  const [query, setQuery] = useState('');
  const [merchant, setMerchant] = useState<Merchant | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      setMerchant(await settlix.merchant(query.trim()));
    } catch (err) {
      setMessage({ tone: 'error', text: explain(err) });
    }
  }

  async function approve() {
    if (!merchant || !address) return;
    setBusy(true);
    setMessage(null);
    try {
      await settlix.approve(address, signer, merchant.address);
      setMerchant(await settlix.merchant(merchant.address));
      setMessage({ tone: 'success', text: `${merchant.name} can now issue invoices.` });
    } catch (err) {
      const text = explain(err);
      setMessage({ tone: 'error', text: /auth/i.test(text) ? 'This wallet is not the registry admin.' : text });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="eyebrow">Platform admin</p>
        <h1 className="mt-2 font-display text-4xl">Merchant approvals</h1>
        <p className="mt-2 text-muted">
          Check the applicant&apos;s documents off-chain, confirm the SHA-256 of their registration number matches the hash below, then approve.
        </p>
      </div>
      <form onSubmit={lookup} className="flex gap-2">
        <input className="field font-mono text-xs" placeholder="Merchant address (G...)" value={query} onChange={(e) => setQuery(e.target.value)} pattern="G[A-Z2-7]{55}" required />
        <button className="btn-primary">Look up</button>
      </form>
      {merchant === null && <Notice>No application from that address.</Notice>}
      {merchant && (
        <Card>
          <p className="font-display text-2xl">{merchant.name}</p>
          <div className="mt-3">
            <Row label="Status">{merchant.status}</Row>
            <Row label="Payout address">{shortAddress(merchant.settlementAddress, 6)}</Row>
            <Row label="Applied">{merchant.registeredAt.toLocaleString()}</Row>
          </div>
          <p className="mt-3 break-all font-mono text-[11px] text-muted">business hash {merchant.businessHash}</p>
          {merchant.status === 'Pending' && (
            <button className="btn-accent mt-5 w-full" onClick={approve} disabled={busy}>
              {busy ? 'Confirm in your wallet...' : 'Approve merchant'}
            </button>
          )}
        </Card>
      )}
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
    </div>
  );
}
