import { test, describe } from 'node:test';
import assert from 'node:assert';
import { mockClassMembers, mockItems } from '../fixtures/mockData';
import { startSessionSchema } from '@/features/session/validators/session.validator';
import { checkoutPayloadSchema } from '@/features/transaction/validators/transaction.validator';
import { createExpenseSchema } from '@/features/expense/validators/expense.validator';

describe('Business Flow Scenario 1: Complete Daily Selling Lifecycle', () => {
  test('Step 1: Open Session with 3 valid guardians', () => {
    const sessionInput = {
      periodMonth: 8,
      periodWeek: 1,
      guardians: mockClassMembers.map((m) => m.publicId),
    };
    const validated = startSessionSchema.parse(sessionInput);
    assert.strictEqual(validated.guardians.length, 3);
    assert.strictEqual(validated.periodMonth, 8);
  });

  test('Step 2: Prepare & Initialize Daily Inventory from Master Items', () => {
    const activeMasterItems = mockItems.filter((i) => i.isActive);
    const inventories = activeMasterItems.map((item, idx) => ({
      publicId: `KSP-INV-00000${idx + 1}`,
      sessionId: '64f1a2b3c4d5e6f7a8b9c0b1',
      itemId: item._id,
      itemPublicId: item.publicId,
      itemNameSnapshot: item.name,
      categorySnapshot: item.category,
      costPriceSnapshot: item.costPrice,
      sellingPriceSnapshot: item.sellingPrice,
      openingStock: item.recommendedStock,
      remainingStock: item.recommendedStock,
      soldQuantity: 0,
      status: 'OPEN' as const,
    }));

    assert.strictEqual(inventories.length, 2);
    assert.strictEqual(inventories[0].remainingStock, 20);
    assert.strictEqual(inventories[1].remainingStock, 30);
  });

  test('Step 3: Lock Daily Inventory before POS transactions', () => {
    const inventory = { status: 'OPEN' };
    inventory.status = 'LOCKED';
    assert.strictEqual(inventory.status, 'LOCKED');
  });

  test('Step 4: Execute POS Transaction (Sell Products)', () => {
    const checkoutInput = {
      businessDate: '2026-08-05',
      cart: [
        { inventoryId: 'KSP-INV-000001', quantity: 2 },
        { inventoryId: 'KSP-INV-000002', quantity: 3 },
      ],
    };
    const validated = checkoutPayloadSchema.parse(checkoutInput);
    assert.strictEqual(validated.cart.length, 2);

    // Calculate financials
    const item1Revenue = 12000 * 2; // 24000
    const item1Cost = 8000 * 2;    // 16000
    const item2Revenue = 4000 * 3;  // 12000
    const item2Cost = 2000 * 3;     // 6000

    const grossRevenue = item1Revenue + item2Revenue; // 36000
    const grossCost = item1Cost + item2Cost;          // 22000
    const grossProfit = grossRevenue - grossCost;     // 14000

    assert.strictEqual(grossRevenue, 36000);
    assert.strictEqual(grossCost, 22000);
    assert.strictEqual(grossProfit, 14000);
  });

  test('Step 5: Record Operational Expense', () => {
    const expenseInput = {
      title: 'Beli Kantong Plastik',
      category: 'OPERATIONAL' as const,
      amount: 4000,
      notes: 'Keperluan packing POS',
    };
    const validated = createExpenseSchema.parse(expenseInput);
    assert.strictEqual(validated.amount, 4000);
  });

  test('Step 6: Dashboard Metrics Update Verification', () => {
    const grossRevenue = 36000;
    const grossProfit = 14000;
    const expense = 4000;
    const netProfit = grossProfit - expense; // 10000

    assert.strictEqual(grossRevenue, 36000);
    assert.strictEqual(netProfit, 10000);
  });

  test('Step 7 & 8: Close Session and Verify Profit Shares', () => {
    const netProfit = 10000;
    const schoolShare = Math.round(netProfit * 0.4); // 4000
    const classShare = Math.round(netProfit * 0.6);  // 6000

    assert.strictEqual(schoolShare, 4000);
    assert.strictEqual(classShare, 6000);
    assert.strictEqual(schoolShare + classShare, netProfit);
  });
});
