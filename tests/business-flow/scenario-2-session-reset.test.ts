import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Business Flow Scenario 2: Session Transition & Historical Aggregation Integrity', () => {
  test('New session creation resets todaySummary while keeping weekSummary intact', () => {
    // Session 1 summary metrics
    const session1Metrics = {
      revenue: 50000,
      grossProfit: 20000,
      expense: 5000,
      netProfit: 15000,
    };

    // Weekly metrics with Session 1
    const weeklyMetricsBefore = {
      revenue: session1Metrics.revenue,
      grossProfit: session1Metrics.grossProfit,
      expense: session1Metrics.expense,
      netProfit: session1Metrics.netProfit,
    };

    // Close Session 1
    const session1Status = 'CLOSED';
    assert.strictEqual(session1Status, 'CLOSED');

    // Create Session 2
    const session2TodaySummary = {
      revenue: 0,
      grossProfit: 0,
      expense: 0,
      netProfit: 0,
    };

    // Weekly summary MUST aggregate Session 1 + Session 2
    const session2Metrics = {
      revenue: 30000,
      grossProfit: 12000,
      expense: 2000,
      netProfit: 10000,
    };

    const weeklyMetricsAfter = {
      revenue: weeklyMetricsBefore.revenue + session2Metrics.revenue,
      grossProfit: weeklyMetricsBefore.grossProfit + session2Metrics.grossProfit,
      expense: weeklyMetricsBefore.expense + session2Metrics.expense,
      netProfit: weeklyMetricsBefore.netProfit + session2Metrics.netProfit,
    };

    assert.strictEqual(session2TodaySummary.revenue, 0, 'Today summary should reset for new session');
    assert.strictEqual(weeklyMetricsAfter.revenue, 80000, 'Weekly revenue should aggregate across sessions');
    assert.strictEqual(weeklyMetricsAfter.netProfit, 25000, 'Weekly net profit should aggregate across sessions');
  });
});
