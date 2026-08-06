import { test, describe } from 'node:test';
import assert from 'node:assert';
import { checkoutPayloadSchema } from '@/features/transaction/validators/transaction.validator';
import { createExpenseSchema, updateExpenseSchema } from '@/features/expense/validators/expense.validator';
import { startSessionSchema } from '@/features/session/validators/session.validator';
import { initializeInventorySchema, updateOpeningStockSchema } from '@/features/inventory/validators/inventory.validator';

describe('Unit Tests: Zod Validators', () => {
  test('checkoutPayloadSchema should accept valid POS checkout payload', () => {
    const validPayload = {
      businessDate: '2026-08-05',
      cart: [
        {
          inventoryId: '64f1a2b3c4d5e6f7a8b9c0c1',
          quantity: 2,
        },
      ],
    };
    const parsed = checkoutPayloadSchema.parse(validPayload);
    assert.strictEqual(parsed.businessDate, '2026-08-05');
    assert.strictEqual(parsed.cart.length, 1);
  });

  test('checkoutPayloadSchema should reject invalid quantity or missing fields', () => {
    const invalidPayload = {
      businessDate: 'invalid-date',
      cart: [],
    };
    assert.throws(() => checkoutPayloadSchema.parse(invalidPayload));
  });

  test('createExpenseSchema and updateExpenseSchema should validate expense inputs', () => {
    const validExpense = {
      title: 'Beli Kertas Struk',
      category: 'OPERATIONAL',
      amount: 15000,
      notes: 'Pembelian di toko ATK',
    };
    const parsed = createExpenseSchema.parse(validExpense);
    assert.strictEqual(parsed.amount, 15000);
    assert.strictEqual(parsed.category, 'OPERATIONAL');

    const updateExpense = { title: 'Judul Baru', amount: 20000 };
    const parsedUpdate = updateExpenseSchema.parse(updateExpense);
    assert.strictEqual(parsedUpdate.amount, 20000);
  });

  test('createExpenseSchema should reject negative amount', () => {
    const invalidExpense = {
      title: 'Minus Expense',
      category: 'OPERATIONAL',
      amount: -5000,
    };
    assert.throws(() => createExpenseSchema.parse(invalidExpense));
  });

  test('startSessionSchema should validate period month (1-12) and week (1-5)', () => {
    const validSession = {
      periodMonth: 8,
      periodWeek: 2,
      guardians: ['KSP-MBR-0001', 'KSP-MBR-0002', 'KSP-MBR-0003'],
    };
    const parsed = startSessionSchema.parse(validSession);
    assert.strictEqual(parsed.periodMonth, 8);

    const invalidSession = {
      periodMonth: 13,
      periodWeek: 1,
      guardians: [],
    };
    assert.throws(() => startSessionSchema.parse(invalidSession));
  });

  test('initializeInventorySchema and updateOpeningStockSchema should validate stock values', () => {
    const initData = {
      sessionId: 'KSP-SESSION-0001',
      items: [
        { itemId: '64f1a2b3c4d5e6f7a8b9c0a1', openingStock: 25 },
      ],
    };
    const parsedInit = initializeInventorySchema.parse(initData);
    assert.strictEqual(parsedInit.items[0].openingStock, 25);

    const updateData = { openingStock: 30 };
    const parsedUpdate = updateOpeningStockSchema.parse(updateData);
    assert.strictEqual(parsedUpdate.openingStock, 30);
  });
});
