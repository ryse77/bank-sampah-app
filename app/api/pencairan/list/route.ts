import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/http/response';
import { listPencairanQuerySchema } from '@/lib/validators/api';

// CRITICAL: Force dynamic rendering - disable ALL caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS: HeadersInit = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0'
};

export async function GET(request: NextRequest) {
  const user = requireAuth(request);
  if (user instanceof Response) return user;

  try {
    const { searchParams } = new URL(request.url);
    const parsedQuery = listPencairanQuerySchema.safeParse({
      status: searchParams.get('status') ?? undefined
    });
    if (!parsedQuery.success) {
      return apiError(parsedQuery.error.issues[0]?.message || 'Query tidak valid', 400);
    }
    const status = parsedQuery.data.status;

    const where: { user_id?: string; status?: string } = {};
    if (user.role === 'pengguna') {
      where.user_id = user.id;
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    const data = await prisma.pencairanSaldo.findMany({
      where,
      include: {
        user: {
          select: { nama_lengkap: true, email: true, no_hp: true }
        },
        pengelola: {
          select: { nama_lengkap: true }
        }
      },
      orderBy: { tanggal_request: 'desc' }
    });

    const formatted = data.map(({ user: userData, pengelola, ...rest }) => ({
      ...rest,
      nominal: Number(rest.nominal),
      users: userData ? {
        nama_lengkap: userData.nama_lengkap,
        email: userData.email,
        no_hp: userData.no_hp
      } : null,
      pengelola: pengelola ? { nama_lengkap: pengelola.nama_lengkap } : null
    }));

    return apiSuccess(formatted, { headers: NO_CACHE_HEADERS });

  } catch (error) {
    console.error('List pencairan error:', error);
    return apiError('Internal server error', 500);
  }
}
