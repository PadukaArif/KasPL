import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function handleApiError(error: unknown, defaultMessage = 'Internal Server Error') {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        code: 'VALIDATION_ERROR',
        message: error.issues[0]?.message || 'Validation error',
      },
      { status: 400 }
    );
  }

  // Handle custom domain service errors (ServiceError, ItemServiceError, ExpenseServiceError, InventoryServiceError, etc.)
  if (error instanceof Error && 'code' in error && typeof (error as { code: unknown }).code === 'string') {
    const serviceError = error as Error & { code: string };
    const isNotFound = serviceError.code.includes('NOT_FOUND');
    return NextResponse.json(
      {
        success: false,
        code: serviceError.code,
        message: serviceError.message,
      },
      { status: isNotFound ? 404 : 400 }
    );
  }

  // Internal Server Error - Log on server without exposing secrets or DB details to client
  console.error('[API Error Sanitized]:', error instanceof Error ? error.stack || error.message : error);

  return NextResponse.json(
    {
      success: false,
      code: 'INTERNAL_ERROR',
      message: defaultMessage,
    },
    { status: 500 }
  );
}
