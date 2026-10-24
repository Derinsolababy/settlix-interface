# Security Policy

Report vulnerabilities privately through
[GitHub private vulnerability reporting](https://github.com/SETTLIX/settlix-interface/security/advisories/new),
not in public issues. We aim to acknowledge reports within 3 business days.

## What this app must guarantee

1. It never asks for, receives, or stores a secret key. All signing happens
   in the user's wallet.
2. What the pay page shows (amount, token, merchant, status) comes from the
   payment contract, not from the URL or the QR code.
3. The transaction a customer is asked to sign is `pay_invoice` on the
   configured payment contract for the invoice on screen, and nothing else.
4. Business registration numbers are hashed in the browser; only the hash
   is sent on-chain.

Issues in the contracts belong in
[settlix-contracts](https://github.com/SETTLIX/settlix-contracts/security),
and issues in pricing or verification in
[settlix-oracle](https://github.com/SETTLIX/settlix-oracle/security).
