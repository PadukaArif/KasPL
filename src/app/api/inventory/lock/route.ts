import { NextResponse } from 'next/server';
import { InventoryService, InventoryServiceError } from '@/features/inventory/services/inventory.service';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: 'sessionId required' }, { status: 400 });
    }
    await InventoryService.lockInventory(sessionId);
    return NextResponse.json({ success: true, message: 'Inventory berhasil dikunci' });
  } catch (error: unknown) {
    if (error instanceof InventoryServiceError) {
      return NextResponse.json({ success: false, code: error.code, message: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, code: 'INTERNAL_ERROR', message }, { status: 500 });
  }
}
