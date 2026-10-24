import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Receipt } from '@/components/Receipt';
import { effectiveStatus, StatusPill } from '@/components/status';
import { Row, Stamp } from '@/components/ui';
import { recentInvoices, rememberInvoice } from '@/lib/recent';

describe('status', () => {
  it('shows open invoices past expiry as expired', () => {
    const now = new Date('2026-10-24T12:00:00Z');
    expect(effectiveStatus('Open', new Date('2026-10-24T11:59:59Z'), now)).toBe('Expired');
    expect(effectiveStatus('Open', new Date('2026-10-24T12:00:01Z'), now)).toBe('Open');
    expect(effectiveStatus('Paid', new Date('2026-10-24T11:00:00Z'), now)).toBe('Paid');
  });

  it('labels statuses for people', () => {
    render(<StatusPill status="Open" />);
    expect(screen.getByText('Awaiting payment')).toBeTruthy();
  });
});

describe('Receipt', () => {
  it('renders title, rows and stamp', () => {
    render(
      <Receipt title="Ada Fabrics" subtitle="ORDER-1001" stamp={<Stamp>Paid</Stamp>}>
        <Row label="Total">25.00 XLM</Row>
      </Receipt>,
    );
    expect(screen.getByText('Ada Fabrics')).toBeTruthy();
    expect(screen.getByText('25.00 XLM')).toBeTruthy();
    expect(screen.getByText('Paid')).toBeTruthy();
  });
});

describe('recent invoices', () => {
  it('keeps newest first, without duplicates, per merchant', () => {
    rememberInvoice('GA', 1);
    rememberInvoice('GA', 2);
    rememberInvoice('GA', 1);
    rememberInvoice('GB', 9);
    expect(recentInvoices('GA')).toEqual([1, 2]);
    expect(recentInvoices('GB')).toEqual([9]);
  });

  it('survives corrupted storage', () => {
    localStorage.setItem('settlix:invoices:GC', '{not json');
    expect(recentInvoices('GC')).toEqual([]);
  });
});
