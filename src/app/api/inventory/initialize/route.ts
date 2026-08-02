import { NextResponse } from 'next/server';
import { InventoryService, InventoryServiceError } from '@/features/inventory/services/inventory.service';
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inventory = await InventoryService.initializeInventory(body);
    return NextResponse.json({ success: true, message: 'Stock berhasil diinisialisasi', data: inventory });
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
