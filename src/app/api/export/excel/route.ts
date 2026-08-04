import { NextResponse } from 'next/server';
import { ExportService } from '@/features/closing/services/export.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID diperlukan' }, { status: 400 });
    }

    const buffer = await ExportService.generateExcel(sessionId);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="KasPL_Export_${sessionId}.xlsx"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal generate Excel';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
