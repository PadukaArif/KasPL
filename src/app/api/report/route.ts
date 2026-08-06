import { NextResponse } from 'next/server';
import { ReportService } from '@/features/report/services/report.service';
import { handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    
    let month = monthParam ? parseInt(monthParam, 10) : null;
    
    if (!month || isNaN(month) || month < 1 || month > 12) {
      month = await ReportService.getCurrentPeriod();
    }

    const data = await ReportService.getPeriodSummary(month);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal memuat laporan');
  }
}
