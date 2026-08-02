import { NextResponse } from 'next/server';
import { POSService } from '@/features/pos/services/pos.service';
import { ServiceError } from '@/utils/errors';
import connectToDatabase from '@/lib/db/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    const items = await POSService.getSellableItems();
    return NextResponse.json({ success: true, data: items });
  } catch (error: unknown) {
    if (error instanceof ServiceError && error.code === 'NO_ACTIVE_SESSION') {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
