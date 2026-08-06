import { NextResponse } from 'next/server';
import { ItemService } from '@/features/item/services/item.service';
import { handleApiError } from '@/utils/apiResponse';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const item = await ItemService.getItemById(id);
    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal memuat detail item');
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const item = await ItemService.updateItem(id, body);
    return NextResponse.json({ success: true, message: 'Item berhasil diperbarui', data: item });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal memperbarui item');
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deactivated = await ItemService.deactivateItem(id);
    return NextResponse.json({ success: true, message: 'Item berhasil dihapus', data: deactivated });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal menghapus item');
  }
}
