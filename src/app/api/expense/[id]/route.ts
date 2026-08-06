import { NextResponse } from 'next/server';
import { ExpenseService } from '@/features/expense/services/expense.service';
import { handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const expense = await ExpenseService.getExpenseById(id);
    return NextResponse.json({ success: true, data: expense });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal mengambil detail pengeluaran');
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const expense = await ExpenseService.updateExpense(id, body);
    return NextResponse.json({ success: true, message: 'Pengeluaran berhasil diubah', data: expense });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal mengubah pengeluaran');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await ExpenseService.deleteExpense(id);
    return NextResponse.json({ success: true, message: 'Pengeluaran berhasil dihapus' });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal menghapus pengeluaran');
  }
}
