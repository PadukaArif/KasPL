import { NextResponse } from 'next/server';
import { ClosingService } from '@/features/closing/services/closing.service';
import { handleApiError } from '@/utils/apiResponse';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: 'Session ID diperlukan' }, { status: 400 });
    }

    const summary = await ClosingService.calculateSummary(sessionId);

    return NextResponse.json({ success: true, data: summary });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal mengambil ringkasan sesi');
  }
}
