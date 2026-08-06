import { test, describe } from 'node:test';
import assert from 'node:assert';
import { formatCurrency, formatDate, formatDateToIndonesian, formatNumber } from '@/utils/formatters';

describe('Unit Tests: Formatter Functions', () => {
  test('formatCurrency should format numbers to IDR currency string', () => {
    const formatted = formatCurrency(15000);
    assert.ok(formatted.includes('15.000'), `Expected 15.000 in ${formatted}`);
  });

  test('formatCurrency should handle zero and negative amounts', () => {
    const zero = formatCurrency(0);
    assert.ok(zero.includes('0'), `Expected 0 in ${zero}`);

    const negative = formatCurrency(-5000);
    assert.ok(negative.includes('5.000'), `Expected 5.000 in ${negative}`);
  });

  test('formatNumber should format integers with ID-ID thousands separators', () => {
    const num = formatNumber(1250000);
    assert.strictEqual(num.replace(/\s/g, ''), '1.250.000');
  });

  test('formatDateToIndonesian should format Date objects correctly', () => {
    const date = new Date('2026-08-05T00:00:00Z');
    const formatted = formatDateToIndonesian(date);
    assert.ok(formatted.toLowerCase().includes('agustus'), `Expected 'agustus' in ${formatted}`);
  });

  test('formatDate should return formatted date and time string', () => {
    const formatted = formatDate(new Date('2026-08-05T10:30:00Z'));
    assert.ok(typeof formatted === 'string' && formatted.length > 0);
  });
});
