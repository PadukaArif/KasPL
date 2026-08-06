import { NextResponse, NextRequest } from 'next/server';
import { TransactionService } from '@/features/transaction/services/transaction.service';
import { handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));

    const result = await TransactionService.getTransactions({
      search,
      startDate,
      endDate,
      status,
      page,
      limit,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal memuat transaksi');
  }
}
