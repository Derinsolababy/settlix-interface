/**
 * End-to-end check against the live testnet contracts, through the same
 * client code the app uses, with keypairs standing in for Freighter.
 *
 *   ADMIN_SECRET=S... npm run smoke
 *
 * ADMIN_SECRET is the registry admin (the deployer from settlix-contracts).
 * Creates and funds a fresh merchant and customer with Friendbot, then:
 * apply -> approve -> create invoice -> pay -> read back as Paid.
 */
import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk';
import { config } from '../src/lib/config';
import { createClient, type Signer } from '../src/lib/contracts';
import { sha256Hex } from '../src/lib/format';
import { formatAmount } from '../src/lib/money';

const signerFor = (kp: Keypair): Signer => async (txXdr, { networkPassphrase }) => {
  const tx = TransactionBuilder.fromXDR(txXdr, networkPassphrase);
  tx.sign(kp);
  return tx.toXDR();
};

async function fund(kp: Keypair) {
  const res = await fetch(`https://friendbot.stellar.org/?addr=${kp.publicKey()}`);
  if (!res.ok) throw new Error(`friendbot ${res.status}`);
}

async function main() {
  if (config.network !== 'testnet') throw new Error('smoke test only runs on testnet');
  const admin = Keypair.fromSecret(process.env.ADMIN_SECRET ?? '');
  const merchant = Keypair.random();
  const customer = Keypair.random();
  await Promise.all([fund(merchant), fund(customer)]);
  const client = createClient(config);
  const xlm = config.tokens.find((t) => t.code === 'XLM')!.contractId;
  const step = (s: string) => console.log(`- ${s}`);

  await client.apply(merchant.publicKey(), signerFor(merchant), {
    name: 'Smoke Test Stores',
    businessHash: await sha256Hex('RC-SMOKE'),
    settlementAddress: merchant.publicKey(),
  });
  step(`applied: ${(await client.merchant(merchant.publicKey()))?.status}`);

  await client.approve(admin.publicKey(), signerFor(admin), merchant.publicKey());
  step(`approved: ${(await client.merchant(merchant.publicKey()))?.status}`);

  const { id } = await client.createInvoice(merchant.publicKey(), signerFor(merchant), {
    token: xlm,
    amount: 123_456_789n,
    reference: `SMOKE-${Date.now().toString(36)}`,
    expiresAt: new Date(Date.now() + 15 * 60_000),
  });
  step(`invoice #${id}: ${(await client.invoice(id))?.status}`);

  const { hash } = await client.payInvoice(customer.publicKey(), signerFor(customer), id);
  const paid = await client.invoice(id);
  step(`paid in ${hash}: ${paid?.status}, fee ${formatAmount(paid!.fee)} XLM`);

  try {
    await client.payInvoice(customer.publicKey(), signerFor(customer), id);
    throw new Error('second payment was accepted');
  } catch (err) {
    step(`second payment rejected: ${(err as Error).message}`);
  }
  if (paid?.status !== 'Paid') throw new Error('invoice not paid');
  console.log(`ok: invoice #${id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
