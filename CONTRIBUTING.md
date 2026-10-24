# Contributing to Settlix Interface

## Setup

```bash
git clone https://github.com/<you>/settlix-interface.git
cd settlix-interface
npm install
npm run dev
```

Node 20.11 or newer (`.nvmrc` pins 22). Install
[Freighter](https://www.freighter.app/) and switch it to testnet to try
wallet flows.

Have an old fork? Sync it first:
`gh repo sync <you>/settlix-interface --source SETTLIX/settlix-interface --branch main`.

## Workflow

1. Open or claim an issue for anything beyond a typo.
2. Branch from `main` and use
   [Conventional Commits](https://www.conventionalcommits.org/):
   `feat(pay): ...`, `fix(merchant): ...`.
3. Run `npm run lint && npm run typecheck && npm test && npm run build`.
   CI runs the same.
4. Changes to `src/lib/contracts.ts` should also pass `npm run smoke`.
5. Open a pull request with screenshots for visual changes, linking the
   issue with `Closes #N`.

## Guidelines

- **Chain is the source of truth.** Do not cache invoice or merchant state
  beyond a render; read it again.
- **No floats for money.** Use `src/lib/money.ts`.
- **Errors in plain words.** Add new contract error codes to `explain()`.
- **Use the design tokens** in `tailwind.config.ts` rather than raw colors,
  and check pages at 390 px wide.
- **Accessible by default:** real buttons and labels, visible focus, and
  status changes announced with `role="status"`.

## Code of conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
