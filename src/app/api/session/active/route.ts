import { NextResponse } from 'next/server';
import { SessionService } from '@/features/session/services/session.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await SessionService.getActiveSession();
    return NextResponse.json({ success: true, data: session });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
