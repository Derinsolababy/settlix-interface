'use client';

import { shortAddress } from '@/lib/format';
import { useWallet } from '@/lib/wallet';

export function ConnectButton({ className = 'btn-primary' }: { className?: string }) {
  const { address, installed, connecting, connect } = useWallet();
  if (address) {
    return (
      <span className="inline-flex items-center gap-2 rounded-md border border-ink/15 bg-card px-3 py-2 font-mono text-xs" title={address}>
        <span className="h-2 w-2 rounded-full bg-settled" aria-hidden />
        {shortAddress(address, 5)}
      </span>
    );
  }
  if (installed === false) {
    return (
      <a className={className} href="https://www.freighter.app/" target="_blank" rel="noreferrer">
        Install Freighter
      </a>
    );
  }
  return (
    <button className={className} onClick={connect} disabled={connecting}>
      {connecting ? 'Connecting...' : 'Connect wallet'}
    </button>
  );
}

/** Shown in place of a page's content until a wallet is connected on the right network. */
export function WalletGate({ children, purpose }: { children: React.ReactNode; purpose: string }) {
  const { address, wrongNetwork, error } = useWallet();
  if (!address) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-dashed border-ink/25 bg-card p-8 text-center">
        <p className="font-display text-2xl">Connect a wallet</p>
        <p className="mt-2 text-sm text-muted">{purpose}</p>
        <div className="mt-6">
          <ConnectButton />
        </div>
        {error && <p className="mt-3 text-sm text-accent-dark">{error}</p>}
      </div>
    );
  }
  if (wrongNetwork) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-caution/40 bg-caution-soft p-6 text-sm text-caution">
        Freighter is on a different network. Switch it to <strong>{process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet'}</strong>, then reload.
      </div>
    );
  }
  return <>{children}</>;
}
