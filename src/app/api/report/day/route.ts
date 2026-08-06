import { NextResponse } from 'next/server';
import { ReportService } from '@/features/report/services/report.service';
import { handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: 'Date parameter is required (YYYY-MM-DD)' }, { status: 400 });
    }

    const data = await ReportService.getDayDetail(dateParam);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal memuat detail laporan harian');
  }
}
