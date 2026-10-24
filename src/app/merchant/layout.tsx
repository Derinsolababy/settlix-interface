import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Merchant console' };

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return children;
}
