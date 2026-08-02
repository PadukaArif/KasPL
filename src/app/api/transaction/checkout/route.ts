import { NextResponse } from 'next/server';
import { TransactionService } from '@/features/transaction/services/transaction.service';
import { ServiceError } from '@/utils/errors';
import { ZodError } from 'zod';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await TransactionService.checkout(payload);

    return NextResponse.json({
      success: true,
      message: 'Checkout successful',
      data: result,
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          code: 'VALIDATION_ERROR',
          message: error.issues[0].message,
        },
        { status: 400 }
      );
    }
    if (error instanceof ServiceError) {
      return NextResponse.json(
        {
          success: false,
          code: error.code,
          message: error.message,
        },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      {
        success: false,
        code: 'INTERNAL_ERROR',
        message,
      },
      { status: 500 }
    );
  }
}
