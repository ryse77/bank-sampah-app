import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSetoranSchema } from '@/lib/validators/api';
import { parseRequestBody } from '@/lib/validators/parse';
import { apiError, apiSuccess } from '@/lib/http/response';

export async function POST(request: NextRequest) {
  const user = requireAuth(request);
  if (user instanceof Response) return user;

  try {
    const parsed = await parseRequestBody(request, createSetoranSchema);
    if (!parsed.success) {
      return apiError(parsed.error, 400);
    }
    const { jenis_sampah, metode } = parsed.data;

    const data = await prisma.setoranSampah.create({
      data: {
        user_id: user.id,
        jenis_sampah,
        metode,
        status: 'pending'
      }
    });

    return apiSuccess({
      message: 'Setoran berhasil dibuat',
      data
    }, 201);

  } catch (error) {
    console.error('Create setoran error:', error);
    return apiError('Internal server error', 500);
  }
}
