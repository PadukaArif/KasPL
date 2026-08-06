import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PIN = process.env.ADMIN_PIN || 'kaspl2026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin } = body;

    if (!pin || pin.trim() !== ADMIN_PIN) {
      return NextResponse.json(
        { success: false, message: 'PIN Admin salah. Akses ditolak.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'PIN Admin terverifikasi.',
    });

    response.cookies.set({
      name: 'kaspl_admin_verified',
      value: 'true',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
