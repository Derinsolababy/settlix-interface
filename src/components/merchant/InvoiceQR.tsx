'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { effectiveStatus, StatusPill } from '@/components/status';
import { Row, Stamp } from '@/components/ui';
import { tokenByContract } from '@/lib/config';
import type { Invoice } from '@/lib/contracts';
import { relativeTime } from '@/lib/format';
import { formatAmount, splitFee } from '@/lib/money';
import { settlix } from '@/lib/settlix';
import { usePoll } from '@/lib/usePoll';

/** The counter screen: a scannable link to the pay page that flips to PAID on its own. */
export function InvoiceQR({ initial, feeBps }: { initial: Invoice; feeBps: number }) {
  const [url, setUrl] = useState('');
  useEffect(() => setUrl(`${window.location.origin}/pay/${initial.id}`), [initial.id]);
  const { data } = usePoll(() => settlix.invoice(initial.id), 4000, true, [initial.id]);
  const inv = data ?? initial;
  const status = effectiveStatus(inv.status, inv.expiresAt);
  const code = tokenByContract(inv.token)?.code ?? 'tokens';
  // After payment the contract records the actual fee; before it, preview at the current rate.
  const fee = inv.status === 'Open' ? splitFee(inv.amount, feeBps).fee : inv.fee;

  return (
    <div className="relative rounded-lg border border-rule bg-card p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-muted">invoice #{inv.id} · {inv.reference}</p>
        <StatusPill status={status} />
      </div>
      <div className={`mx-auto mt-5 w-fit rounded-md bg-white p-3 ${status !== 'Open' ? 'opacity-25' : ''}`}>
        {url && <QRCodeSVG value={url} size={208} level="M" marginSize={1} fgColor="#1C1B19" />}
      </div>
      {status === 'Paid' && (
        <div className="absolute inset-x-0 top-28 flex justify-center">
          <Stamp>Paid</Stamp>
        </div>
      )}
      <p className="mt-5 text-center font-display text-3xl">
        {formatAmount(inv.amount)} <span className="text-lg text-muted">{code}</span>
      </p>
      <div className="mt-4">
        <Row label="You receive">{formatAmount(inv.amount - fee)} {code}</Row>
        <Row label="Platform fee">{formatAmount(fee)} {code}</Row>
        <Row label={status === 'Open' ? 'Expires' : 'Expiry'}>{relativeTime(inv.expiresAt)}</Row>
      </div>
      {url && (
        <div className="mt-5 flex gap-2">
          <button className="btn-ghost flex-1 text-xs" onClick={() => navigator.clipboard?.writeText(url)}>Copy link</button>
          <a className="btn-ghost flex-1 text-xs" href={url} target="_blank" rel="noreferrer">Open pay page</a>
        </div>
      )}
    </div>
  );
}
