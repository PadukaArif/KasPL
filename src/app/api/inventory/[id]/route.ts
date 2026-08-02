import { NextResponse } from 'next/server';
import { InventoryService, InventoryServiceError } from '@/features/inventory/services/inventory.service';
import { z } from 'zod';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const updated = await InventoryService.updateOpeningStock(id, body);
    return NextResponse.json({ success: true, message: 'Opening stock berhasil diupdate', data: updated });
  } catch (error: unknown) {
    if (error instanceof InventoryServiceError) {
      return NextResponse.json({ success: false, code: error.code, message: error.message }, { status: 400 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: error.issues[0].message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, code: 'INTERNAL_ERROR', message }, { status: 500 });
  }
}
