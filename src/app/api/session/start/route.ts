import { NextResponse } from 'next/server';
import { SessionService } from '@/features/session/services/session.service';
import { handleApiError } from '@/utils/apiResponse';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await SessionService.startSession(body);
    return NextResponse.json({ success: true, data: session });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal memulai sesi');
  }
}
