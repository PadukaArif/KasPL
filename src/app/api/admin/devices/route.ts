import { NextRequest, NextResponse } from 'next/server';
import { DeviceService } from '@/features/device/services/device.service';

export async function GET() {
  try {
    const devices = await DeviceService.getActiveDevices();
    return NextResponse.json({
      success: true,
      data: devices,
    });
  } catch (error: unknown) {
    console.error('Fetch devices error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil daftar perangkat.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, deviceId } = body;

    if (action === 'revoke' && deviceId) {
      const revoked = await DeviceService.revokeDevice(deviceId);
      if (revoked) {
        return NextResponse.json({
          success: true,
          message: 'Akses perangkat berhasil dicabut.',
        });
      }
      return NextResponse.json(
        { success: false, message: 'Perangkat tidak ditemukan atau gagal dicabut.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Aksi tidak valid.' },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error('Revoke device error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mencabut akses perangkat.' },
      { status: 500 }
    );
  }
}
