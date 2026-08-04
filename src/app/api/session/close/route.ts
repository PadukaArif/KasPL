import { NextResponse } from 'next/server';
import { ClosingService } from '@/features/closing/services/closing.service';
import { closeSessionSchema } from '@/features/closing/types/closing.types';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = closeSessionSchema.parse(body);

    const result = await ClosingService.closeSession(parsed.sessionId);
    return NextResponse.json({ success: true, data: result.summary });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validasi gagal', details: error.issues }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Gagal menutup sesi';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
