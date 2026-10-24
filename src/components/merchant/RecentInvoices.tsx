'use client';

import { effectiveStatus, StatusPill } from '@/components/status';
import { Spinner } from '@/components/ui';
import { tokenByContract } from '@/lib/config';
import type { Invoice } from '@/lib/contracts';
import { formatAmount } from '@/lib/money';
import { recentInvoices } from '@/lib/recent';
import { settlix } from '@/lib/settlix';
import { usePoll } from '@/lib/usePoll';

export function RecentInvoices({ merchant, refreshKey, onSelect }: { merchant: string; refreshKey: number; onSelect: (inv: Invoice) => void }) {
  const { data, loading } = usePoll(
    async () => (await Promise.all(recentInvoices(merchant).map((id) => settlix.invoice(id)))).filter((x): x is Invoice => !!x),
    15_000,
    true,
    [merchant, refreshKey],
  );

  if (loading && !data) return <Spinner label="Loading invoices" />;
  if (!data?.length) return <p className="text-sm text-muted">Invoices you create in this browser appear here.</p>;

  return (
    <ul className="divide-y divide-rule">
      {data.map((inv) => (
        <li key={inv.id}>
          <button onClick={() => onSelect(inv)} className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-paper/60">
            <span>
              <span className="block font-mono text-sm">{inv.reference}</span>
              <span className="text-xs text-muted">#{inv.id} · {inv.createdAt.toLocaleString()}</span>
            </span>
            <span className="text-right">
              <span className="block font-mono text-sm">
                {formatAmount(inv.amount)} {tokenByContract(inv.token)?.code}
              </span>
              <StatusPill status={effectiveStatus(inv.status, inv.expiresAt)} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
