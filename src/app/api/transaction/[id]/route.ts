import { NextResponse, NextRequest } from 'next/server';
import { TransactionService } from '@/features/transaction/services/transaction.service';
import { handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await TransactionService.getTransactionDetail(id);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal memuat detail transaksi');
  }
}
