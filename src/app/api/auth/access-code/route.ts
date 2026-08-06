import { NextRequest, NextResponse } from 'next/server';
import { DeviceService, DeviceServiceError } from '@/features/device/services/device.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, deviceId, platform } = body;

    const userAgent = req.headers.get('user-agent') || 'Unknown Browser';
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const result = await DeviceService.verifyAndBindDevice({
      code,
      deviceId,
      userAgent,
      platform,
      ipAddress,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Perangkat berhasil diotorisasi.',
      data: result,
    });

    // Set cookie for automatic browser authentication
    response.cookies.set({
      name: 'kaspl_device_token',
      value: result.deviceToken,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });

    // Also set deviceId cookie for easy client identification
    response.cookies.set({
      name: 'kaspl_device_id',
      value: result.deviceId,
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof DeviceServiceError) {
      return NextResponse.json(
        { success: false, message: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Access Code Verification Error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat memproses kode akses.' },
      { status: 500 }
    );
  }
}
