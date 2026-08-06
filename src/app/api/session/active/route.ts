import { NextResponse } from 'next/server';
import { SessionService } from '@/features/session/services/session.service';
import { handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await SessionService.getActiveSession();
    return NextResponse.json({ success: true, data: session });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal memuat sesi aktif');
  }
}
