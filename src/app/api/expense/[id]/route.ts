import { NextResponse } from 'next/server';
import { ExpenseService, ExpenseServiceError } from '@/features/expense/services/expense.service';
import { z } from 'zod';

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
    if (error instanceof ExpenseServiceError) {
      return NextResponse.json({ success: false, code: error.code, message: error.message }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, code: 'INTERNAL_ERROR', message }, { status: 500 });
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
    if (error instanceof ExpenseServiceError) {
      const status = error.code === 'EXPENSE_NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ success: false, code: error.code, message: error.message }, { status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: error.issues[0].message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, code: 'INTERNAL_ERROR', message }, { status: 500 });
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
    if (error instanceof ExpenseServiceError) {
      const status = error.code === 'EXPENSE_NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ success: false, code: error.code, message: error.message }, { status });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, code: 'INTERNAL_ERROR', message }, { status: 500 });
  }
}
