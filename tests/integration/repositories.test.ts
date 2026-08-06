import { test, describe } from 'node:test';
import assert from 'node:assert';
import { mockItems, mockExpenses, mockDailyInventories, mockSellingSession } from '../fixtures/mockData';
import { cloneFixture, assertValidPublicId } from '../helpers/testUtils';

describe('Integration Tests: Repository Contracts & Query Structures', () => {
  test('ItemRepository structure and query filters match expectations', () => {
    const items = cloneFixture(mockItems);
    assert.strictEqual(items.length, 2);
    assertValidPublicId(items[0].publicId, 'KSP-ITEM-');
    assert.strictEqual(items[0].category, 'FOOD');
    assert.strictEqual(items[1].category, 'DRINK');
  });

  test('ExpenseRepository structure and category filters', () => {
    const expenses = cloneFixture(mockExpenses);
    assert.strictEqual(expenses.length, 1);
    assertValidPublicId(expenses[0].publicId, 'KSP-EXP-');
    assert.strictEqual(expenses[0].category, 'OPERATIONAL');
    assert.strictEqual(expenses[0].deletedAt, null);
  });

  test('InventoryRepository stock snapshot mappings', () => {
    const inventories = cloneFixture(mockDailyInventories);
    assert.strictEqual(inventories.length, 2);
    assertValidPublicId(inventories[0].publicId, 'KSP-INV-');
    assert.strictEqual(inventories[0].sessionId, mockSellingSession._id);
    assert.strictEqual(inventories[0].openingStock, 20);
    assert.strictEqual(inventories[0].remainingStock, 15);
    assert.strictEqual(inventories[0].soldQuantity, 5);
  });
});
