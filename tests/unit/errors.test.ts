import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ServiceError } from '@/utils/errors';
import { ExpenseServiceError } from '@/features/expense/services/expense.service';
import { InventoryServiceError } from '@/features/inventory/services/inventory.service';
import { ItemServiceError } from '@/features/item/services/item.service';

describe('Unit Tests: Error Handling Classes', () => {
  test('ServiceError should properly set message, code, and name', () => {
    const err = new ServiceError('Barang tidak ditemukan', 'NOT_FOUND');
    assert.strictEqual(err.message, 'Barang tidak ditemukan');
    assert.strictEqual(err.code, 'NOT_FOUND');
    assert.strictEqual(err.name, 'ServiceError');
    assert.ok(err instanceof Error);
  });

  test('ExpenseServiceError should preserve prototype and error code', () => {
    const err = new ExpenseServiceError('Sesi tidak aktif', 'NO_ACTIVE_SESSION');
    assert.strictEqual(err.message, 'Sesi tidak aktif');
    assert.strictEqual(err.code, 'NO_ACTIVE_SESSION');
    assert.ok(err instanceof ExpenseServiceError);
    assert.ok(err instanceof Error);
  });

  test('InventoryServiceError should preserve prototype and error code', () => {
    const err = new InventoryServiceError('Stock dikunci', 'INVENTORY_LOCKED');
    assert.strictEqual(err.code, 'INVENTORY_LOCKED');
    assert.ok(err instanceof InventoryServiceError);
  });

  test('ItemServiceError should preserve prototype and error code', () => {
    const err = new ItemServiceError('Nama barang sudah digunakan', 'DUPLICATE_NAME');
    assert.strictEqual(err.code, 'DUPLICATE_NAME');
    assert.ok(err instanceof ItemServiceError);
  });
});
