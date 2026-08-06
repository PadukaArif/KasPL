import { NextResponse } from 'next/server';
import { InventoryService } from '@/features/inventory/services/inventory.service';
import { handleApiError } from '@/utils/apiResponse';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inventory = await InventoryService.initializeInventory(body);
    return NextResponse.json({ success: true, message: 'Stock berhasil diinisialisasi', data: inventory });
  } catch (error: unknown) {
    return handleApiError(error, 'Gagal menginisialisasi stock');
  }
}
