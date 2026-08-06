import { NextResponse } from 'next/server';
import { ExpenseService } from '@/features/expense/services/expense.service';
import { handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));

    const result = await ExpenseService.getExpenses({ search, category, startDate, endDate, page, limit });
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal memuat pengeluaran');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const expense = await ExpenseService.createExpense(body);
    return NextResponse.json({ success: true, message: 'Pengeluaran berhasil ditambahkan', data: expense }, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal menambahkan pengeluaran');
  }
}
