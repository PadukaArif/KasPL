import { NextResponse } from 'next/server';
import { ExportService } from '@/features/closing/services/export.service';
import { handleApiError } from '@/utils/apiResponse';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId') || undefined;

    const buffer = await ExportService.generateExcel(sessionId);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="KasPL_Export_${sessionId}.xlsx"`,
      },
    });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal generate Excel');
  }
}
