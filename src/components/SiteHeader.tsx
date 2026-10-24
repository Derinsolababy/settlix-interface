import Link from 'next/link';
import { config } from '@/lib/config';
import { ConnectButton } from './ConnectButton';

export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      {config.network !== 'mainnet' && (
        <div className="bg-ink px-4 py-1.5 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-card">
          {config.network}: test money only
        </div>
      )}
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="font-display text-2xl font-semibold italic tracking-tight">
          settlix<span className="text-accent">.</span>
        </Link>
        <div className="flex items-center gap-1 text-sm sm:gap-4">
          <Link href="/merchant" className="rounded px-2 py-1 hover:bg-card">Merchant</Link>
          <Link href="/admin" className="hidden rounded px-2 py-1 hover:bg-card sm:inline">Admin</Link>
          <ConnectButton />
        </div>
      </nav>
    </header>
  );
}
