'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ConnectButton } from '@/components/ConnectButton';
import { Receipt } from '@/components/Receipt';
import { effectiveStatus } from '@/components/status';
import { Notice, Row, Spinner, Stamp } from '@/components/ui';
import { config, tokenByContract } from '@/lib/config';
import { explain } from '@/lib/contracts';
import { relativeTime, shortAddress } from '@/lib/format';
import { formatAmount } from '@/lib/money';
import { settlix } from '@/lib/settlix';
import { usePoll } from '@/lib/usePoll';
import { useWallet } from '@/lib/wallet';

export default function PayPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const valid = Number.isInteger(id) && id > 0;
  const { address, wrongNetwork, signer } = useWallet();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tx, setTx] = useState<string | null>(null);

  const invoice = usePoll(() => (valid ? settlix.invoice(id) : Promise.resolve(null)), 5000, valid && !tx, [id]);
  const merchant = usePoll(
    () => (invoice.data ? settlix.merchant(invoice.data.merchant) : Promise.resolve(null)),
    60_000,
    false,
    [invoice.data?.merchant],
  );

  if (!valid) return <Notice tone="error">That is not a valid invoice link.</Notice>;
  if (invoice.loading && invoice.data === undefined) return <Spinner label="Fetching invoice from the network" />;
  if (invoice.error && invoice.data === undefined) return <Notice tone="error" title="Could not reach the network">{invoice.error}</Notice>;
  const inv = invoice.data;
  if (!inv) return <Notice tone="error" title="Invoice not found">No invoice #{id} exists on {config.network}.</Notice>;

  const status = effectiveStatus(inv.status, inv.expiresAt);
  const code = tokenByContract(inv.token)?.code ?? 'tokens';
  const name = merchant.data?.name ?? shortAddress(inv.merchant);

  async function pay() {
    if (!address) return;
    setBusy(true);
    setError(null);
    try {
      const { hash } = await settlix.payInvoice(address, signer, id);
      setTx(hash);
      await invoice.reload();
    } catch (err) {
      setError(explain(err));
    } finally {
      setBusy(false);
    }
  }

  const stamp =
    status === 'Paid' ? <Stamp>Paid</Stamp> : status === 'Expired' ? <Stamp tone="muted">Expired</Stamp> : status === 'Cancelled' ? <Stamp tone="muted">Void</Stamp> : status !== 'Open' ? <Stamp tone="accent">Refunded</Stamp> : undefined;

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <Receipt title={name} subtitle={`${inv.reference} · invoice #${inv.id}`} stamp={stamp}>
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted">{inv.paidAt ? 'Amount paid' : 'Amount due'}</p>
        <p className="mt-1 text-center font-display text-5xl">{formatAmount(inv.amount)}</p>
        <p className="text-center font-mono text-sm text-muted">{code}</p>
        <div className="my-5 border-t border-dashed border-ink/30" />
        <Row label="Merchant">{shortAddress(inv.merchant)}</Row>
        <Row label="Created">{inv.createdAt.toLocaleString()}</Row>
        {status === 'Open' && <Row label="Expires">{relativeTime(inv.expiresAt)}</Row>}
        {inv.paidAt && <Row label="Paid">{inv.paidAt.toLocaleString()}</Row>}
        {inv.customer && <Row label="Paid by">{shortAddress(inv.customer)}</Row>}
        {inv.refunded > 0n && <Row label="Refunded">{formatAmount(inv.refunded)} {code}</Row>}
      </Receipt>

      {status === 'Open' && (
        <div className="space-y-3">
          {merchant.data && merchant.data.status !== 'Active' && (
            <Notice tone="caution">This merchant is not currently active, so the payment would be rejected.</Notice>
          )}
          {!address ? (
            <div className="text-center">
              <ConnectButton className="btn-accent w-full py-3 text-base" />
              <p className="mt-2 text-xs text-muted">Pay with the Freighter wallet on {config.network}.</p>
            </div>
          ) : wrongNetwork ? (
            <Notice tone="caution">Switch Freighter to {config.network} to pay.</Notice>
          ) : (
            <button className="btn-accent w-full py-3.5 text-base" onClick={pay} disabled={busy}>
              {busy ? 'Confirm in your wallet...' : `Pay ${formatAmount(inv.amount)} ${code}`}
            </button>
          )}
          {error && <Notice tone="error">{error}</Notice>}
          <p className="text-center text-xs text-muted">
            One transaction: the merchant is paid and the platform fee is taken together. Nothing is held in between.
          </p>
        </div>
      )}

      {status === 'Paid' && (
        <Notice tone="success" title="Payment settled">
          {tx ? (
            <a className="underline" href={`${config.explorer}/tx/${tx}`} target="_blank" rel="noreferrer">
              View the transaction
            </a>
          ) : (
            'This invoice has been paid. You can close this page.'
          )}
        </Notice>
      )}
      {status === 'Expired' && <Notice>This invoice expired before it was paid. Ask the merchant for a new one.</Notice>}
      {status === 'Cancelled' && <Notice>The merchant cancelled this invoice.</Notice>}
    </div>
  );
}
