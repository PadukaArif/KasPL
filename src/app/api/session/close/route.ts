import { NextResponse } from 'next/server';
import { SessionService } from '@/features/session/services/session.service';

export async function POST(request: Request) {
  try {
    const { publicId } = await request.json();
    if (!publicId) {
      return NextResponse.json({ success: false, error: 'publicId required' }, { status: 400 });
    }
    const session = await SessionService.closeSession(publicId);
    return NextResponse.json({ success: true, data: session });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
