import { NextResponse } from 'next/server';
import { ItemService, ItemServiceError } from '@/features/item/services/item.service';
import { z } from 'zod';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const item = await ItemService.getItemById(id);
    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    if (error instanceof ItemServiceError) {
      return NextResponse.json({ success: false, code: error.code, message: error.message }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, code: 'INTERNAL_ERROR', message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const item = await ItemService.updateItem(id, body);
    return NextResponse.json({ success: true, message: 'Item berhasil diperbarui', data: item });
  } catch (error: unknown) {
    if (error instanceof ItemServiceError) {
      return NextResponse.json({ success: false, code: error.code, message: error.message }, { status: 400 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: error.issues[0].message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, code: 'INTERNAL_ERROR', message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deactivated = await ItemService.deactivateItem(id);
    return NextResponse.json({ success: true, message: 'Item berhasil dihapus', data: deactivated });
  } catch (error: unknown) {
    if (error instanceof ItemServiceError) {
      return NextResponse.json({ success: false, code: error.code, message: error.message }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, code: 'INTERNAL_ERROR', message }, { status: 500 });
  }
}
