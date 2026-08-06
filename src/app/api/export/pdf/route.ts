import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId') || 'active';

  // Redirect to the frontend print view which acts as PDF layout
  const printUrl = new URL(`/print/${sessionId}?format=pdf`, req.url).toString();
  return NextResponse.redirect(printUrl);
}
