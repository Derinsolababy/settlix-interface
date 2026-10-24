import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk';
import { Buffer } from 'buffer';

export type MerchantStatus = 'Pending' | 'Active' | 'Suspended';
export type InvoiceStatus = 'Open' | 'Paid' | 'Cancelled' | 'PartiallyRefunded' | 'Refunded';

export interface Merchant {
  address: string;
  name: string;
  businessHash: string;
  settlementAddress: string;
  status: MerchantStatus;
  registeredAt: Date;
}

export interface Invoice {
  id: number;
  merchant: string;
  token: string;
  amount: bigint;
  reference: string;
  status: InvoiceStatus;
  expiresAt: Date;
  createdAt: Date;
  customer: string | null;
  payee: string | null;
  fee: bigint;
  refunded: bigint;
  paidAt: Date | null;
}

/** Signs a transaction envelope (base64 XDR) and returns the signed XDR. */
export type Signer = (txXdr: string, opts: { networkPassphrase: string; address: string }) => Promise<string>;

export interface Network {
  rpcUrl: string;
  networkPassphrase: string;
  contracts: { registry: string; payment: string; settlement: string };
}

/** A contract call failed with one of the contract's typed error codes. */
export class ContractError extends Error {
  constructor(
    readonly method: string,
    readonly code: number,
  ) {
    super(`${method} failed with contract error #${code}`);
  }
}

// Messages for the errors a user can actually cause, by contract and code.
const PAYMENT_ERRORS: Record<number, string> = {
  3: 'Payments are paused by the platform.',
  4: 'The amount must be greater than zero.',
  5: 'The reference must be 1 to 64 characters.',
  6: 'You already used this reference for another invoice.',
  7: 'This merchant is not active, so it cannot invoice or be paid.',
  8: 'This token is not accepted by the platform.',
  9: 'Invoice not found.',
  10: 'This invoice is no longer open.',
  11: 'This invoice has expired.',
  12: 'The expiry must be in the future.',
};
const REGISTRY_ERRORS: Record<number, string> = {
  3: 'This wallet has already applied.',
  4: 'No merchant registered for this wallet.',
  5: 'The business name must be 1 to 64 characters.',
  6: 'That status change is not allowed.',
};

export function explain(err: unknown): string {
  if (err instanceof ContractError) {
    const table = err.method.startsWith('registry.') ? REGISTRY_ERRORS : PAYMENT_ERRORS;
    return table[err.code] ?? err.message;
  }
  const msg = err instanceof Error ? err.message : String(err);
  if (/rejected|declined|denied/i.test(msg)) return 'You declined the request in your wallet.';
  if (/resulting balance is not within the allowed range|balance/i.test(msg)) return 'Not enough balance to pay this invoice.';
  if (/trustline/i.test(msg)) return 'Your account has no trustline for this asset.';
  return msg;
}

const toDate = (secs: bigint | number) => new Date(Number(secs) * 1000);
const variant = (v: unknown) => (Array.isArray(v) ? v[0] : v) as string;
const u64 = (n: number | bigint) => nativeToScVal(n, { type: 'u64' });
const i128 = (n: bigint) => nativeToScVal(n, { type: 'i128' });
const str = (s: string) => nativeToScVal(s, { type: 'string' });
const addr = (a: string) => new Address(a).toScVal();
const bytes32 = (hex: string) => xdr.ScVal.scvBytes(Buffer.from(hex, 'hex'));

export function parseInvoice(raw: any): Invoice {
  return {
    id: Number(raw.id),
    merchant: raw.merchant,
    token: raw.token,
    amount: BigInt(raw.amount),
    reference: raw.reference,
    status: variant(raw.status) as InvoiceStatus,
    expiresAt: toDate(raw.expires_at),
    createdAt: toDate(raw.created_at),
    customer: raw.customer ?? null,
    payee: raw.payee ?? null,
    fee: BigInt(raw.fee),
    refunded: BigInt(raw.refunded),
    paidAt: BigInt(raw.paid_at) > 0n ? toDate(raw.paid_at) : null,
  };
}

export function parseMerchant(raw: any): Merchant {
  return {
    address: raw.address,
    name: raw.name,
    businessHash: Array.from(raw.business_hash as Uint8Array, (b) => b.toString(16).padStart(2, '0')).join(''),
    settlementAddress: raw.settlement_address,
    status: variant(raw.status) as MerchantStatus,
    registeredAt: toDate(raw.registered_at),
  };
}

export function createClient(net: Network, server = new rpc.Server(net.rpcUrl)) {
  const readSource = Keypair.random().publicKey();

  function build(source: Account, contractId: string, method: string, args: xdr.ScVal[]) {
    return new TransactionBuilder(source, { fee: BASE_FEE, networkPassphrase: net.networkPassphrase })
      .addOperation(new Contract(contractId).call(method, ...args))
      .setTimeout(120)
      .build();
  }

  function fail(label: string, error: string): never {
    const code = /Error\(Contract, #(\d+)\)/.exec(error)?.[1];
    if (code) throw new ContractError(label, Number(code));
    throw new Error(error.split('\n')[0].slice(0, 300));
  }

  async function read(label: string, contractId: string, method: string, args: xdr.ScVal[] = []) {
    const sim = await server.simulateTransaction(build(new Account(readSource, '0'), contractId, method, args));
    if (rpc.Api.isSimulationError(sim)) fail(label, sim.error);
    return scValToNative(sim.result!.retval);
  }

  /** Simulates, asks `signer` to sign, submits, and waits for the ledger to close. */
  async function write(label: string, from: string, signer: Signer, contractId: string, method: string, args: xdr.ScVal[]) {
    // Build once: each build() advances the account's sequence number.
    const tx = build(await server.getAccount(from), contractId, method, args);
    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) fail(label, sim.error);
    const prepared = rpc.assembleTransaction(tx, sim).build();
    const signed = await signer(prepared.toXDR(), { networkPassphrase: net.networkPassphrase, address: from });
    const sent = await server.sendTransaction(TransactionBuilder.fromXDR(signed, net.networkPassphrase));
    if (sent.status === 'ERROR') {
      const code = sent.errorResult?.result().switch().name ?? 'unknown';
      throw new Error(`${label}: the network rejected the transaction (${code})`);
    }
    const done = await server.pollTransaction(sent.hash, { attempts: 30, sleepStrategy: () => 1000 });
    if (done.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
      throw new Error(`${label}: transaction ${done.status.toLowerCase()} (${sent.hash})`);
    }
    return { hash: sent.hash, result: done.returnValue ? scValToNative(done.returnValue) : undefined };
  }

  const c = net.contracts;
  return {
    async merchant(address: string): Promise<Merchant | null> {
      try {
        return parseMerchant(await read('registry.get_merchant', c.registry, 'get_merchant', [addr(address)]));
      } catch (err) {
        if (err instanceof ContractError && err.code === 4) return null;
        throw err;
      }
    },
    async isTokenAllowed(token: string): Promise<boolean> {
      return Boolean(await read('registry.is_token_allowed', c.registry, 'is_token_allowed', [addr(token)]));
    },
    async feeBps(): Promise<number> {
      return Number(await read('settlement.fee_bps', c.settlement, 'fee_bps'));
    },
    async invoice(id: number): Promise<Invoice | null> {
      try {
        return parseInvoice(await read('payment.get_invoice', c.payment, 'get_invoice', [u64(id)]));
      } catch (err) {
        if (err instanceof ContractError && err.code === 9) return null;
        throw err;
      }
    },

    apply(merchant: string, signer: Signer, p: { name: string; businessHash: string; settlementAddress: string }) {
      return write('registry.apply', merchant, signer, c.registry, 'apply', [
        addr(merchant), str(p.name), bytes32(p.businessHash), addr(p.settlementAddress),
      ]);
    },
    approve(admin: string, signer: Signer, merchant: string) {
      return write('registry.approve', admin, signer, c.registry, 'approve', [addr(merchant)]);
    },
    async createInvoice(merchant: string, signer: Signer, p: { token: string; amount: bigint; reference: string; expiresAt: Date }) {
      const { hash, result } = await write('payment.create_invoice', merchant, signer, c.payment, 'create_invoice', [
        addr(merchant), addr(p.token), i128(p.amount), str(p.reference), u64(Math.floor(p.expiresAt.getTime() / 1000)),
      ]);
      return { hash, id: Number(result) };
    },
    payInvoice(customer: string, signer: Signer, id: number) {
      return write('payment.pay_invoice', customer, signer, c.payment, 'pay_invoice', [addr(customer), u64(id)]);
    },
    cancelInvoice(merchant: string, signer: Signer, id: number) {
      return write('payment.cancel_invoice', merchant, signer, c.payment, 'cancel_invoice', [u64(id)]);
    },
  };
}

export type SettlixClient = ReturnType<typeof createClient>;
