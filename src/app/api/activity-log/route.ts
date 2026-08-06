import { NextResponse } from 'next/server';
import { ActivityLogService } from '@/features/activityLog/services/activityLog.service';
import { handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));

    const result = await ActivityLogService.getLogs({ search, page, limit });
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal memuat log aktivitas');
  }
}
