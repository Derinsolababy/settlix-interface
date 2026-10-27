# Settlix Interface

[![CI](https://github.com/SETTLIX/settlix-interface/actions/workflows/ci.yml/badge.svg)](https://github.com/SETTLIX/settlix-interface/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The web app for Settlix. Merchants issue on-chain invoices and show a QR
code; customers scan it and pay with their Stellar wallet; the merchant is
settled in the same transaction.

Part of the Settlix stack:
[settlix-contracts](https://github.com/SETTLIX/settlix-contracts) ·
[settlix-oracle](https://github.com/SETTLIX/settlix-oracle) ·
[settlix-interface](https://github.com/SETTLIX/settlix-interface) (this repo)

## What is in it

| Route | Who | What |
| --- | --- | --- |
| `/` | everyone | What Settlix does, with the live fee rate read from the settlement contract |
| `/merchant` | merchants | Apply (business ID is hashed in the browser), wait for approval, then create invoices priced in USD or in the asset, and show a QR code that turns into a PAID stamp by itself once the customer pays |
| `/pay/[id]` | customers | The invoice as a receipt; pay it with Freighter in one transaction |
| `/admin` | registry admin | Look up an applicant and approve it |

Everything is read from and written to the contracts directly through
Soroban RPC. There is no Settlix backend holding state, and the app never
sees a private key: every write is signed in the
[Freighter](https://www.freighter.app/) wallet.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000, against the public testnet deployment
```

It works without a `.env` file: defaults point at the testnet contracts in
[settlix-contracts/deployments/testnet.json](https://github.com/SETTLIX/settlix-contracts/blob/main/deployments/testnet.json).
To price invoices in USD, also run
[settlix-oracle](https://github.com/SETTLIX/settlix-oracle) on port 3001.
Without it, merchants can still price invoices directly in XLM or USDC.

To try the full flow you need two Freighter accounts on testnet, funded with
Friendbot. One is the merchant; a registry admin must approve it (see
`/admin`). The other is the customer.

## Scripts

| Command | |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint`, `npm run typecheck` | ESLint, `tsc --noEmit` |
| `npm test` | Vitest: money math, contract decoding, error messages, components |
| `npm run smoke` | End-to-end on testnet through the app's own contract client: creates a merchant and a customer, applies, approves, invoices, pays, and checks a second payment is rejected. Needs `ADMIN_SECRET` (the registry admin) |

## Configuration

All settings are public `NEXT_PUBLIC_*` variables; see
[.env.example](.env.example). No secrets belong in this app.

## How it works

See [docs/architecture.md](docs/architecture.md).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) and the
[Code of Conduct](CODE_OF_CONDUCT.md). Contributors are listed in
[CONTRIBUTORS.md](CONTRIBUTORS.md).

## License

[MIT](LICENSE)
<!-- fix: addresses issue #197 - [Performance] Excessive re-renders caused by non-memoized context value -->
