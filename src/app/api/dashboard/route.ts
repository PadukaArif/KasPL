import { NextResponse } from 'next/server';
import { DashboardService } from '@/features/dashboard/services/dashboard.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await DashboardService.getDashboardData();
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Dashboard Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, code: 'INTERNAL_ERROR', message }, { status: 500 });
  }
}
