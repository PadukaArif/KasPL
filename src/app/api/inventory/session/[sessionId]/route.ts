import { NextResponse } from 'next/server';
import { InventoryService } from '@/features/inventory/services/inventory.service';

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { sessionId } = await context.params;
    const inventory = await InventoryService.getInventoryBySession(sessionId);
    return NextResponse.json({ success: true, data: inventory });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, code: 'INTERNAL_ERROR', message }, { status: 500 });
  }
}
