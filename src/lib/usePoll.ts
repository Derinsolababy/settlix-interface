'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Loads `fn` now and every `intervalMs` while `active`; `reload` forces a refresh. */
export function usePoll<T>(fn: () => Promise<T>, intervalMs: number, active = true, deps: unknown[] = []) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const reload = useCallback(async () => {
    try {
      setData(await fnRef.current());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => void reload(), intervalMs);
    return () => clearInterval(t);
  }, [active, intervalMs, reload]);

  return { data, error, loading, reload };
}
