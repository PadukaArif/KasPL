import { NextResponse } from 'next/server';
import { InventoryService } from '@/features/inventory/services/inventory.service';
import { handleApiError } from '@/utils/apiResponse';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId } = body;
    if (!sessionId) {
      return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: 'sessionId is required' }, { status: 400 });
    }
    const result = await InventoryService.syncInventory(sessionId);
    return NextResponse.json({ success: true, message: 'Daily inventory synced successfully', data: result });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal meng-sync inventory');
  }
}
