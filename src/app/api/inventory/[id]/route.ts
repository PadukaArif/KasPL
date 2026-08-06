import { NextResponse } from 'next/server';
import { InventoryService } from '@/features/inventory/services/inventory.service';
import { handleApiError } from '@/utils/apiResponse';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const updated = await InventoryService.updateOpeningStock(id, body);
    return NextResponse.json({ success: true, message: 'Opening stock berhasil diupdate', data: updated });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal mengupdate opening stock');
  }
}
