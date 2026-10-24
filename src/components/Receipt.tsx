import type { ReactNode } from 'react';

/** A paper receipt: perforated edges, a header, and dotted-leader rows. */
export function Receipt({ title, subtitle, children, stamp }: { title: string; subtitle?: string; children: ReactNode; stamp?: ReactNode }) {
  return (
    <div className="relative">
      <div className="perforated bg-card px-7 py-9 shadow-receipt">
        <div className="text-center">
          <p className="font-display text-xl font-semibold">{title}</p>
          {subtitle && <p className="mt-0.5 font-mono text-xs text-muted">{subtitle}</p>}
        </div>
        <div className="my-5 border-t border-dashed border-ink/30" />
        {children}
      </div>
      {stamp && <div className="pointer-events-none absolute right-5 top-[6.5rem]">{stamp}</div>}
    </div>
  );
}
