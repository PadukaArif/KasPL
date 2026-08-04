import { NextResponse } from 'next/server';
import { ExportService } from '@/features/closing/services/export.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID diperlukan' }, { status: 400 });
    }

    const data = await ExportService.getExportData(sessionId);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil data cetak';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
