/** Invoice IDs a merchant created in this browser, newest first. Not authoritative: status always comes from the chain. */
const key = (merchant: string) => `settlix:invoices:${merchant}`;

export function recentInvoices(merchant: string): number[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key(merchant)) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

export function rememberInvoice(merchant: string, id: number) {
  try {
    const ids = [id, ...recentInvoices(merchant).filter((x) => x !== id)].slice(0, 25);
    localStorage.setItem(key(merchant), JSON.stringify(ids));
  } catch {
    /* storage unavailable: the list is a convenience only */
  }
}
