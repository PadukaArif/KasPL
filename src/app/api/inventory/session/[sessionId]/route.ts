import { NextResponse } from 'next/server';
import { InventoryService } from '@/features/inventory/services/inventory.service';
import { handleApiError } from '@/utils/apiResponse';

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { sessionId } = await context.params;
    const inventory = await InventoryService.getInventoryBySession(sessionId);
    return NextResponse.json({ success: true, data: inventory });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal memuat inventory sesi');
  }
}
