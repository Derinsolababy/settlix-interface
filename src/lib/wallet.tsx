'use client';

import { getAddress, getNetwork, isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { config } from './config';
import type { Signer } from './contracts';

interface WalletState {
  address: string | null;
  installed: boolean | null;
  wrongNetwork: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  signer: Signer;
}

const WalletContext = createContext<WalletState | null>(null);

const signer: Signer = async (txXdr, opts) => {
  const res = await signTransaction(txXdr, opts);
  if (res.error) throw new Error(res.error.message ?? 'The wallet declined to sign.');
  return res.signedTxXdr;
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [installed, setInstalled] = useState<boolean | null>(null);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkNetwork = useCallback(async () => {
    const net = await getNetwork();
    setWrongNetwork(!net.error && net.networkPassphrase !== config.networkPassphrase);
  }, []);

  // Restore a previous connection silently; never prompt on page load.
  useEffect(() => {
    (async () => {
      const conn = await isConnected().catch(() => ({ isConnected: false }));
      setInstalled(conn.isConnected);
      if (!conn.isConnected) return;
      const res = await getAddress();
      if (res.address) {
        setAddress(res.address);
        await checkNetwork();
      }
    })();
  }, [checkNetwork]);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const res = await requestAccess();
      if (res.error) throw new Error(res.error.message ?? 'Connection was declined.');
      setAddress(res.address);
      setInstalled(true);
      await checkNetwork();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setConnecting(false);
    }
  }, [checkNetwork]);

  const value = useMemo(
    () => ({ address, installed, wrongNetwork, connecting, error, connect, signer }),
    [address, installed, wrongNetwork, connecting, error, connect],
  );
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
