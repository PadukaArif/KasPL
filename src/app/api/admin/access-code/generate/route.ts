import { NextResponse } from 'next/server';
import { DeviceService } from '@/features/device/services/device.service';

export async function GET() {
  try {
    const codeInfo = await DeviceService.getOrGenerateTodayAccessCode();
    return NextResponse.json({
      success: true,
      data: codeInfo,
    });
  } catch (error: unknown) {
    console.error('Get access code error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil kode akses harian.' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const newCodeInfo = await DeviceService.generateNewAccessCodeForToday();
    return NextResponse.json({
      success: true,
      message: 'Kode akses baru berhasil dibuat.',
      data: newCodeInfo,
    });
  } catch (error: unknown) {
    console.error('Generate access code error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat kode akses baru.' },
      { status: 500 }
    );
  }
}
