import { NextResponse } from 'next/server';
import { ClosingService } from '@/features/closing/services/closing.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID diperlukan' }, { status: 400 });
    }

    const summary = await ClosingService.calculateSummary(sessionId);

    return NextResponse.json({ success: true, data: summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil ringkasan sesi';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
