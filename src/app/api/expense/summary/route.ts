import { NextResponse } from 'next/server';
import { ExpenseService } from '@/features/expense/services/expense.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = await ExpenseService.getExpenseSummary();
    return NextResponse.json({ success: true, data: summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, code: 'INTERNAL_ERROR', message }, { status: 500 });
  }
}
