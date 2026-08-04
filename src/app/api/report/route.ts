import { NextResponse } from 'next/server';
import { ReportService } from '@/features/report/services/report.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    
    let month = monthParam ? parseInt(monthParam, 10) : null;
    
    if (!month || isNaN(month)) {
      month = await ReportService.getCurrentPeriod();
    }

    const data = await ReportService.getPeriodSummary(month);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Report API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, code: 'INTERNAL_ERROR', message }, { status: 500 });
  }
}
