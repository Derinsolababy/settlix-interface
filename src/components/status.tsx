import type { InvoiceStatus } from '@/lib/contracts';

const LABELS: Record<InvoiceStatus | 'Expired', [string, string]> = {
  Open: ['Awaiting payment', 'bg-caution-soft text-caution'],
  Expired: ['Expired', 'bg-rule text-muted'],
  Paid: ['Paid', 'bg-settled-soft text-settled'],
  Cancelled: ['Cancelled', 'bg-rule text-muted'],
  PartiallyRefunded: ['Partly refunded', 'bg-accent-soft text-accent-dark'],
  Refunded: ['Refunded', 'bg-accent-soft text-accent-dark'],
};

export function effectiveStatus(status: InvoiceStatus, expiresAt: Date, now = new Date()): InvoiceStatus | 'Expired' {
  return status === 'Open' && expiresAt <= now ? 'Expired' : status;
}

export function StatusPill({ status }: { status: InvoiceStatus | 'Expired' }) {
  const [label, style] = LABELS[status];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>{label}</span>;
}
