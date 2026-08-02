import { NextResponse } from 'next/server';
import { ItemService, ItemServiceError } from '@/features/item/services/item.service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const result = await ItemService.getItems({ search, category, page, limit });
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, code: 'INTERNAL_ERROR', message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await ItemService.createItem(body);
    return NextResponse.json({ success: true, message: 'Item berhasil ditambahkan', data: item }, { status: 201 });
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
