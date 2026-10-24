import Link from 'next/link';
import { LiveFee } from '@/components/LiveFee';
import { Receipt } from '@/components/Receipt';
import { Row, Stamp } from '@/components/ui';

const STEPS = [
  ['Invoice', 'Enter a USD amount. The oracle prices it in XLM or USDC, and your wallet signs an invoice onto the payment contract with your own reference and an expiry.'],
  ['Scan', 'The customer scans the QR code. It is a plain link to the invoice page, so any phone camera opens it, with no app to install.'],
  ['Settle', 'One transaction pays you and the platform fee at once. The contract checks you are an approved merchant and the invoice is open, and never holds the money.'],
] as const;

const FACTS = [
  ['Paid once', 'Each invoice can be paid once, and each reference used once, enforced by the contract.'],
  ['No custody', 'Funds go straight from customer to merchant. Nothing sits in a platform wallet.'],
  ['Verified merchants', 'Merchants are approved before they can invoice. Only a hash of the business ID is stored on-chain.'],
  ['Honest prices', 'Quotes are the median of CoinGecko and the Stellar DEX, signed, and expire in two minutes.'],
] as const;

export default function Home() {
  return (
    <div className="space-y-24">
      <section className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="eyebrow">Merchant payments on Stellar</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
            Paid at the counter.
            <br />
            <em className="text-accent">Settled</em> before the receipt prints.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Settlix turns a sale into an on-chain invoice your customer pays by QR code in XLM or USDC. You receive the money in
            the same transaction, less a <LiveFee /> platform fee.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/merchant" className="btn-accent px-6 py-3 text-base">Open the merchant console</Link>
            <a href="https://github.com/SETTLIX" className="btn-ghost px-6 py-3 text-base">Read the code</a>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm rotate-[1.5deg]">
          <Receipt title="Ada Fabrics" subtitle="ORDER-1001 · invoice #1" stamp={<Stamp>Paid</Stamp>}>
            <Row label="Ankara, 6 yards">$4.27</Row>
            <div className="my-3 border-t border-dashed border-ink/30" />
            <Row label="Total">25.00 XLM</Row>
            <Row label="To merchant">24.875 XLM</Row>
            <Row label="Platform fee">0.125 XLM</Row>
            <p className="mt-5 text-center font-mono text-[11px] text-muted">sample receipt</p>
          </Receipt>
        </div>
      </section>

      <section>
        <p className="eyebrow">How it works</p>
        <ol className="mt-6 divide-y divide-rule border-y border-rule">
          {STEPS.map(([title, body], i) => (
            <li key={title} className="grid gap-2 py-6 sm:grid-cols-[5rem_12rem_1fr] sm:gap-6">
              <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-2xl">{title}</span>
              <span className="text-muted">{body}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-px overflow-hidden rounded-lg border border-rule bg-rule sm:grid-cols-2">
        {FACTS.map(([title, body]) => (
          <div key={title} className="bg-card p-6">
            <p className="font-display text-xl">{title}</p>
            <p className="mt-2 text-sm text-muted">{body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg bg-ink p-8 text-card sm:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-soft">Three repositories, one flow</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            ['settlix-contracts', 'Soroban: invoices, merchant registry, fee vault.'],
            ['settlix-oracle', 'Prices, signed quotes, payment verification.'],
            ['settlix-interface', 'This app: merchant console and pay page.'],
          ].map(([repo, body]) => (
            <a key={repo} href={`https://github.com/SETTLIX/${repo}`} className="group block border-t border-card/20 pt-4">
              <p className="font-mono text-sm group-hover:text-accent-soft">{repo}</p>
              <p className="mt-1 text-sm text-card/70">{body}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
