import { NextResponse } from 'next/server';
import { ClosingService } from '@/features/closing/services/closing.service';
import { closeSessionSchema } from '@/features/closing/types/closing.types';
import { handleApiError } from '@/utils/apiResponse';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = closeSessionSchema.parse(body);
    const idOrPublicId = parsed.sessionId || parsed.sessionPublicId;

    const result = await ClosingService.closeSession(idOrPublicId!);
    return NextResponse.json({ success: true, data: result.summary });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal menutup sesi');
  }
}
