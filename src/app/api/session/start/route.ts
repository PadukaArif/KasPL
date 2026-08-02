import { NextResponse } from 'next/server';
import { SessionService } from '@/features/session/services/session.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await SessionService.startSession(body);
    return NextResponse.json({ success: true, data: session });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
