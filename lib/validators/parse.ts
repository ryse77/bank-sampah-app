import { NextRequest } from 'next/server';
import { z } from 'zod';

type ParseBodySuccess<T> = {
  success: true;
  data: T;
};

type ParseBodyFailure = {
  success: false;
  error: string;
};

export async function parseRequestBody<T>(
  request: NextRequest,
  schema: z.ZodType<T>,
  fallbackErrorMessage = 'Data tidak valid'
): Promise<ParseBodySuccess<T> | ParseBodyFailure> {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || fallbackErrorMessage
    };
  }

  return {
    success: true,
    data: parsed.data
  };
}
