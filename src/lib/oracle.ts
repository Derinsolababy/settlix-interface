import { config } from './config';

export interface Quote {
  id: string;
  asset: { code: 'XLM' | 'USDC'; issuer: string | null };
  fiatAmount: string;
  price: string;
  amount: string;
  feeBps: number;
  fee: string;
  net: string;
  expiresAt: string;
  signer: string;
  signature: string;
}

/** Prices a USD amount in XLM or USDC through settlix-oracle. */
export async function fetchQuote(asset: 'XLM' | 'USDC', fiatAmount: string): Promise<Quote> {
  let res: Response;
  try {
    res = await fetch(`${config.oracleUrl}/v1/quotes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ asset, fiatAmount }),
    });
  } catch {
    throw new Error('The price oracle is unreachable. Enter the amount in the asset instead.');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message ?? `The price oracle responded ${res.status}.`);
  return body as Quote;
}
