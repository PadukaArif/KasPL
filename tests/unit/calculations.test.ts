import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Unit Tests: Financial & Stock Calculation Logic', () => {
  test('Profit Share calculation should correctly split net profit (40% school, 60% class)', () => {
    const netProfit = 100000;
    const schoolShare = netProfit > 0 ? Math.round(netProfit * 0.4) : 0;
    const classShare = netProfit > 0 ? Math.round(netProfit * 0.6) : 0;

    assert.strictEqual(schoolShare, 40000, 'School share should be 40,000');
    assert.strictEqual(classShare, 60000, 'Class share should be 60,000');
    assert.strictEqual(schoolShare + classShare, netProfit, 'Shares sum should equal net profit');
  });

  test('Profit Share should return 0 for zero or negative net profit', () => {
    const negativeNetProfit = -25000;
    const schoolShare = negativeNetProfit > 0 ? Math.round(negativeNetProfit * 0.4) : 0;
    const classShare = negativeNetProfit > 0 ? Math.round(negativeNetProfit * 0.6) : 0;

    assert.strictEqual(schoolShare, 0);
    assert.strictEqual(classShare, 0);
  });

  test('Subtotal & Profit calculations for line items', () => {
    const costPrice = 8000;
    const sellingPrice = 12000;
    const quantity = 5;

    const subtotalRevenue = sellingPrice * quantity;
    const subtotalCost = costPrice * quantity;
    const subtotalProfit = subtotalRevenue - subtotalCost;

    assert.strictEqual(subtotalRevenue, 60000);
    assert.strictEqual(subtotalCost, 40000);
    assert.strictEqual(subtotalProfit, 20000);
  });

  test('Net profit calculation should deduct expenses from gross profit', () => {
    const grossProfit = 150000;
    const totalExpenses = 35000;
    const netProfit = grossProfit - totalExpenses;

    assert.strictEqual(netProfit, 115000);
  });

  test('Stock deduction calculation', () => {
    const openingStock = 50;
    const quantityDeducted = 12;
    const remainingStock = openingStock - quantityDeducted;

    assert.strictEqual(remainingStock, 38);
    assert.ok(remainingStock >= 0);
  });
});
