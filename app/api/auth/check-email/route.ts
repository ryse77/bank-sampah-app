import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkEmailSchema } from '@/lib/validators/api';
import { parseRequestBody } from '@/lib/validators/parse';
import { apiError, apiSuccess } from '@/lib/http/response';

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseRequestBody(request, checkEmailSchema, 'Email diperlukan');
    if (!parsed.success) {
      return apiError(parsed.error, 400);
    }
    const { email } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return apiSuccess({
      available: !existingUser,
      message: existingUser ? 'Email sudah terdaftar' : 'Email tersedia'
    });

  } catch (error) {
    console.error('Check email error:', error);
    return apiError('Internal server error', 500);
  }
}
