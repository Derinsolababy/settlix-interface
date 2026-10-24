import type { ReactNode } from 'react';

export function Notice({ tone = 'info', title, children }: { tone?: 'info' | 'error' | 'success' | 'caution'; title?: string; children: ReactNode }) {
  const styles = {
    info: 'border-ink/15 bg-card',
    error: 'border-accent/40 bg-accent-soft text-accent-dark',
    success: 'border-settled/40 bg-settled-soft text-settled',
    caution: 'border-caution/40 bg-caution-soft text-caution',
  }[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-md border px-4 py-3 text-sm ${styles}`}>
      {title && <p className="mb-0.5 font-semibold">{title}</p>}
      <div>{children}</div>
    </div>
  );
}

export function Stamp({ children, tone = 'settled' }: { children: ReactNode; tone?: 'settled' | 'accent' | 'muted' }) {
  const color = { settled: 'border-settled text-settled', accent: 'border-accent text-accent', muted: 'border-muted text-muted' }[tone];
  return (
    <span className={`inline-block -rotate-6 rounded border-[3px] border-double px-3 py-1 font-display text-2xl font-black uppercase tracking-widest opacity-90 ${color}`}>
      {children}
    </span>
  );
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="leader py-1 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-mono">{children}</span>
    </div>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted" role="status">
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-muted border-t-transparent" />
      {label}
    </span>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-rule bg-card p-6 ${className}`}>{children}</section>;
}
