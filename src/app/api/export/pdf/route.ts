import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'Session ID diperlukan' }, { status: 400 });
  }

  // Redirect to the frontend print view which acts as PDF layout
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return NextResponse.redirect(`${baseUrl}/print/${sessionId}?format=pdf`);
}
