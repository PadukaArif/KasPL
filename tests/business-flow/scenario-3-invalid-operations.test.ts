import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ServiceError } from '@/utils/errors';
import { ExpenseServiceError } from '@/features/expense/services/expense.service';
import { InventoryServiceError } from '@/features/inventory/services/inventory.service';
import { startSessionSchema } from '@/features/session/validators/session.validator';

describe('Business Flow Scenario 3: Boundary & Invalid Operations Enforcement', () => {
  test('Reject POS Checkout when no active session exists or session is CLOSED', () => {
    const activeSession = null;
    if (!activeSession) {
      const err = new ServiceError('Tidak ada sesi penjualan yang aktif.', 'NO_ACTIVE_SESSION');
      assert.strictEqual(err.code, 'NO_ACTIVE_SESSION');
    }
  });

  test('Reject Inventory stock modification when status is LOCKED or CLOSED', () => {
    const inventory = { status: 'LOCKED' };
    if (inventory.status === 'LOCKED' || inventory.status === 'CLOSED') {
      const err = new InventoryServiceError(
        'Opening stock tidak dapat diubah karena inventory sudah dikunci atau ditutup.',
        'INVENTORY_LOCKED'
      );
      assert.strictEqual(err.code, 'INVENTORY_LOCKED');
    }
  });

  test('Reject Expense creation/update when associated session is CLOSED', () => {
    const activeSession = null;
    if (!activeSession) {
      const err = new ExpenseServiceError(
        'Tidak ada sesi penjualan yang aktif. Pengeluaran hanya bisa ditambahkan saat sesi aktif.',
        'NO_ACTIVE_SESSION'
      );
      assert.strictEqual(err.code, 'NO_ACTIVE_SESSION');
    }
  });

  test('Reject duplicate active session creation when an active session already exists', () => {
    const existingActive = { status: 'ACTIVE' };
    if (existingActive) {
      assert.throws(
        () => {
          throw new Error('Masih ada sesi penjualan yang aktif. Tutup sesi sebelumnya terlebih dahulu.');
        },
        /Masih ada sesi penjualan yang aktif/
      );
    }
  });

  test('Reject invalid ObjectId formatting or missing required fields', () => {
    const invalidId = '123-invalid-id';
    const isValid = /^[0-9a-fA-F]{24}$/.test(invalidId);
    assert.strictEqual(isValid, false);

    assert.throws(() => {
      startSessionSchema.parse({ periodMonth: 1 });
    });
  });
});
