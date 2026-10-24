'use client';

import { useState } from 'react';
import { WalletGate } from '@/components/ConnectButton';
import { ApplyForm } from '@/components/merchant/ApplyForm';
import { InvoiceQR } from '@/components/merchant/InvoiceQR';
import { NewInvoiceForm } from '@/components/merchant/NewInvoiceForm';
import { RecentInvoices } from '@/components/merchant/RecentInvoices';
import { Card, Notice, Row, Spinner } from '@/components/ui';
import type { Invoice } from '@/lib/contracts';
import { shortAddress } from '@/lib/format';
import { settlix } from '@/lib/settlix';
import { usePoll } from '@/lib/usePoll';
import { useWallet } from '@/lib/wallet';

export default function MerchantPage() {
  return (
    <WalletGate purpose="Your wallet is your merchant account. Settlix never holds your keys or your money.">
      <Console />
    </WalletGate>
  );
}

function Console() {
  const { address } = useWallet();
  const merchant = usePoll(() => settlix.merchant(address!), 10_000, true, [address]);
  const fee = usePoll(() => settlix.feeBps(), 300_000, true, []);
  const [current, setCurrent] = useState<Invoice | null>(null);
  const [created, setCreated] = useState(0);

  if (merchant.loading && merchant.data === undefined) return <Spinner label="Looking up your merchant record" />;
  if (merchant.error && merchant.data === undefined) return <Notice tone="error" title="Could not reach the network">{merchant.error}</Notice>;

  const m = merchant.data;
  if (!m) return <ApplyForm onDone={merchant.reload} />;

  if (m.status !== 'Active') {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <p className="eyebrow">{m.status === 'Pending' ? 'Step 2 of 2' : 'Account on hold'}</p>
          <h1 className="mt-2 font-display text-4xl">{m.status === 'Pending' ? 'Application under review' : 'Merchant suspended'}</h1>
          <p className="mt-2 text-muted">
            {m.status === 'Pending'
              ? 'A platform admin approves new merchants. This page updates by itself once you are approved.'
              : 'The platform has suspended this merchant. Open invoices cannot be paid until it is reinstated.'}
          </p>
        </div>
        <Card>
          <Row label="Business">{m.name}</Row>
          <Row label="Payout address">{shortAddress(m.settlementAddress, 6)}</Row>
          <Row label="Business ID hash">{m.businessHash.slice(0, 16)}...</Row>
          <Row label="Applied">{m.registeredAt.toLocaleDateString()}</Row>
        </Card>
      </div>
    );
  }

  const feeBps = fee.data ?? 0;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Merchant console</p>
          <h1 className="mt-2 font-display text-4xl">{m.name}</h1>
        </div>
        <p className="font-mono text-xs text-muted">
          payouts to {shortAddress(m.settlementAddress, 6)} · fee {fee.data === undefined ? '...' : `${feeBps / 100}%`}
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-8">
          <Card>
            <h2 className="mb-5 font-display text-2xl">New invoice</h2>
            <NewInvoiceForm
              feeBps={feeBps}
              onCreated={(inv) => {
                setCurrent(inv);
                setCreated((n) => n + 1);
              }}
            />
          </Card>
          <Card>
            <h2 className="mb-3 font-display text-2xl">Recent invoices</h2>
            <RecentInvoices merchant={address!} refreshKey={created} onSelect={setCurrent} />
          </Card>
        </div>
        <aside className="lg:sticky lg:top-6 lg:self-start">
          {current ? (
            <InvoiceQR key={current.id} initial={current} feeBps={feeBps} />
          ) : (
            <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-ink/25 p-6 text-center text-sm text-muted">
              Create an invoice and its QR code shows here, ready for the customer to scan.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
