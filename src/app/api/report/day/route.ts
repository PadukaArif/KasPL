import { NextResponse } from 'next/server';
import { ReportService } from '@/features/report/services/report.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    if (!dateParam) {
      return NextResponse.json({ success: false, message: 'Date parameter is required (YYYY-MM-DD)' }, { status: 400 });
    }

    const data = await ReportService.getDayDetail(dateParam);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Report API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, code: 'INTERNAL_ERROR', message }, { status: 500 });
  }
}
