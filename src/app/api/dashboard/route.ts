import { NextResponse } from 'next/server';
import { DashboardService } from '@/features/dashboard/services/dashboard.service';
import { handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await DashboardService.getDashboardData();
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal memuat data dashboard');
  }
}
