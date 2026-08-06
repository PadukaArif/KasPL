import { NextRequest, NextResponse } from 'next/server';
import { DeviceService } from '@/features/device/services/device.service';

export async function GET(req: NextRequest) {
  try {
    const tokenFromCookie = req.cookies.get('kaspl_device_token')?.value;
    const tokenFromHeader = req.headers.get('x-device-token');
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return NextResponse.json({ authorized: false, message: 'Device token not found' });
    }

    const device = await DeviceService.verifyDeviceToken(token);

    if (!device) {
      return NextResponse.json({ authorized: false, message: 'Device is not authorized or access has been revoked' });
    }

    return NextResponse.json({
      authorized: true,
      data: {
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        browser: device.browser,
        platform: device.platform,
        lastActive: device.lastActive,
      },
    });
  } catch (error: unknown) {
    console.error('Device verification error:', error);
    return NextResponse.json({ authorized: false, message: 'Server error verifying device' }, { status: 500 });
  }
}
