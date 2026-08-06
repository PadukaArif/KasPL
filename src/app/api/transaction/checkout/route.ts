import { NextResponse } from 'next/server';
import { TransactionService } from '@/features/transaction/services/transaction.service';
import { handleApiError } from '@/utils/apiResponse';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await TransactionService.checkout(payload);

    return NextResponse.json({
      success: true,
      message: 'Checkout successful',
      data: result,
    });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal memproses checkout');
  }
}
