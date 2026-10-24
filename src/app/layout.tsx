import type { Metadata, Viewport } from 'next';
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import { SiteHeader } from '@/components/SiteHeader';
import { WalletProvider } from '@/lib/wallet';
import './globals.css';

const display = Fraunces({ subsets: ['latin'], variable: '--font-display', axes: ['opsz'] });
const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: { default: 'Settlix', template: '%s | Settlix' },
  description: 'Invoice in USDC or XLM, get paid by QR code, settled on Stellar in the same transaction.',
};

export const viewport: Viewport = { themeColor: '#F3EEE3' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <WalletProvider>
          <SiteHeader />
          <main className="mx-auto max-w-6xl px-5 py-10 sm:py-14">{children}</main>
          <footer className="mx-auto max-w-6xl border-t border-rule px-5 py-8 text-xs text-muted">
            Settlix is open source:{' '}
            <a className="underline" href="https://github.com/SETTLIX">github.com/SETTLIX</a>. Contracts are unaudited.
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
