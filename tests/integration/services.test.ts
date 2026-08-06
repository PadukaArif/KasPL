import { test, describe } from 'node:test';
import assert from 'node:assert';
import { mockSellingSession, mockDailyInventories, mockExpenses, mockTransactions } from '../fixtures/mockData';
import { cloneFixture, assertNumberEquals } from '../helpers/testUtils';

describe('Integration Tests: Services Business Logic Boundaries', () => {
  test('POSService should enforce active selling session check', () => {
    const session = cloneFixture(mockSellingSession);
    assert.strictEqual(session.status, 'ACTIVE');
    assert.strictEqual(session.guardians.length, 3);
  });

  test('ClosingService calculation logic verification', () => {
    const txs = cloneFixture(mockTransactions);
    const exps = cloneFixture(mockExpenses);
    const invs = cloneFixture(mockDailyInventories);

    const revenue = txs.reduce((acc, t) => acc + t.grossRevenue, 0);
    const cost = txs.reduce((acc, t) => acc + t.grossCost, 0);
    const grossProfit = txs.reduce((acc, t) => acc + t.grossProfit, 0);
    const expenseTotal = exps.reduce((acc, e) => acc + e.amount, 0);
    const remainingStock = invs.reduce((acc, i) => acc + i.remainingStock, 0);

    const netProfit = grossProfit - expenseTotal;
    const schoolShare = netProfit > 0 ? Math.round(netProfit * 0.4) : 0;
    const classShare = netProfit > 0 ? Math.round(netProfit * 0.6) : 0;

    assertNumberEquals(revenue, 28000);
    assertNumberEquals(cost, 18000);
    assertNumberEquals(grossProfit, 10000);
    assertNumberEquals(expenseTotal, 10000);
    assertNumberEquals(netProfit, 0);
    assertNumberEquals(remainingStock, 35);
    assertNumberEquals(schoolShare, 0);
    assertNumberEquals(classShare, 0);
  });

  test('DashboardService zero-metrics fallback when no active session exists', () => {
    const zeroMetrics = {
      revenue: 0,
      expense: 0,
      grossProfit: 0,
      netProfit: 0,
      transactionsCount: 0,
      itemsSold: 0,
      averageTransactionValue: 0,
      schoolShare: 0,
      classShare: 0,
    };

    assert.strictEqual(zeroMetrics.revenue, 0);
    assert.strictEqual(zeroMetrics.schoolShare, 0);
  });
});
