# Architecture

```
src/
  app/                 routes (App Router)
    page.tsx           landing
    merchant/          console: apply, invoice, QR
    pay/[id]/          customer pay page
    admin/             merchant approvals
  components/          Receipt, status pills, wallet gate, merchant panels
  lib/
    config.ts          network, contract and token IDs (env with testnet defaults)
    contracts.ts       Soroban client: reads by simulation, writes via a Signer
    wallet.tsx         Freighter connection and Signer, as React context
    oracle.ts          USD quotes from settlix-oracle
    money.ts           bigint stroop math (no floats)
    recent.ts          invoice IDs this browser created (convenience only)
```

## Reading

`contracts.ts` builds a transaction with a throwaway source account, calls
`simulateTransaction`, and decodes the return value. No account or fee is
needed, so the pay page works before a wallet is connected. Pages poll:
the pay page every 5 s and the merchant's QR panel every 4 s, so both flip
to PAID without a refresh.

## Writing

`write()` loads the signer's account, simulates to get the footprint and
resource fee, assembles the transaction, hands the XDR to a `Signer`, sends
it, and polls until the ledger closes. The `Signer` is Freighter in the
browser and a `Keypair` in `scripts/smoke-testnet.ts`, so the smoke test
exercises exactly the code the UI runs.

Contract errors come back as `Error(Contract, #n)` and become a
`ContractError`; `explain()` maps the codes a user can cause to plain
sentences ("This invoice has expired.").

## Money

Amounts are bigints in stroops end to end. `formatAmount` only formats for
display, and `splitFee` uses the contract's rounding, so the "you receive"
preview matches what lands in the merchant's account.

## QR codes

The QR code encodes `https://<host>/pay/<invoice id>`, an ordinary URL any
phone camera opens. Everything else (amount, token, merchant) is read from
the chain on that page, so a QR code cannot be edited to change the amount.

## Design

Receipt paper (`paper`, `card`), ink, one terracotta accent, and a ledger
green reserved for settled money. Fraunces for display, IBM Plex Sans for
text, IBM Plex Mono for amounts and addresses. Tokens are in
`tailwind.config.ts`.
