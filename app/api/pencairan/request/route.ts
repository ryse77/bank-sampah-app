import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pencairanRequestSchema } from '@/lib/validators/api';
import { parseRequestBody } from '@/lib/validators/parse';
import { apiError, apiSuccess } from '@/lib/http/response';

export async function POST(request: NextRequest) {
  const user = requireAuth(request);
  if (user instanceof Response) return user;

  try {
    const parsed = await parseRequestBody(request, pencairanRequestSchema, 'Nominal tidak valid');
    if (!parsed.success) {
      return apiError(parsed.error, 400);
    }
    const { nominal } = parsed.data;

    // Check saldo user
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { saldo: true }
    });

    if (!userData) {
      return apiError('User tidak ditemukan', 404);
    }

    if (Number(userData.saldo ?? 0) < nominal) {
      return apiError('Saldo tidak mencukupi', 400);
    }

    // Create pencairan request
    const data = await prisma.pencairanSaldo.create({
      data: {
        user_id: user.id,
        nominal,
        status: 'pending'
      }
    });

    return apiSuccess({
      message: 'Permintaan pencairan berhasil dibuat',
      data: {
        ...data,
        nominal: Number(data.nominal)
      }
    }, 201);

  } catch (error) {
    console.error('Request pencairan error:', error);
    return apiError('Internal server error', 500);
  }
}
