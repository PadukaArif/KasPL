import { NextResponse } from 'next/server';
import { ExportService } from '@/features/closing/services/export.service';
import { handleApiError } from '@/utils/apiResponse';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId') || undefined;

    const data = await ExportService.getExportData(sessionId);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal mengambil data cetak');
  }
}
