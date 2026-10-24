'use client';

import { useEffect, useState } from 'react';
import { settlix } from '@/lib/settlix';

/** The platform fee, read from the settlement contract rather than hard-coded. */
export function LiveFee() {
  const [bps, setBps] = useState<number | null>(null);
  useEffect(() => {
    settlix.feeBps().then(setBps, () => setBps(null));
  }, []);
  return <>{bps === null ? '...' : `${(bps / 100).toFixed(2).replace(/\.?0+$/, '')}%`}</>;
}
