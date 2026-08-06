import { NextResponse } from 'next/server';
import { ExpenseService } from '@/features/expense/services/expense.service';
import { handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = await ExpenseService.getExpenseSummary();
    return NextResponse.json({ success: true, data: summary });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal memuat ringkasan pengeluaran');
  }
}
