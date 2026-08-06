import { NextResponse } from 'next/server';
import { POSService } from '@/features/pos/services/pos.service';
import connectToDatabase from '@/lib/db/mongodb';
import { handleApiError } from '@/utils/apiResponse';

export async function GET() {
  try {
    await connectToDatabase();
    const items = await POSService.getSellableItems();
    return NextResponse.json({ success: true, data: items });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal memuat barang POS');
  }
}
