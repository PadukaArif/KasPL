import { NextResponse } from 'next/server';
import { InventoryService } from '@/features/inventory/services/inventory.service';
import { handleApiError } from '@/utils/apiResponse';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: 'sessionId required' }, { status: 400 });
    }
    await InventoryService.lockInventory(sessionId);
    return NextResponse.json({ success: true, message: 'Inventory berhasil dikunci' });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal mengunci inventory');
  }
}
