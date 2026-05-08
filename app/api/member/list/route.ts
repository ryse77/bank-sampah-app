import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/http/response';
import { memberListQuerySchema } from '@/lib/validators/api';

// CRITICAL: Force dynamic rendering - disable ALL caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS: HeadersInit = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0'
};

export async function GET(request: NextRequest) {
  const user = requireRole(request, ['admin', 'pengelola']);
  if (user instanceof Response) return user;

  try {
    const { searchParams } = new URL(request.url);
    const parsedQuery = memberListQuerySchema.safeParse({
      role: searchParams.get('role') ?? undefined,
      search: searchParams.get('search') ?? undefined
    });
    if (!parsedQuery.success) {
      return apiError(parsedQuery.error.issues[0]?.message || 'Query tidak valid', 400);
    }
    const { role, search } = parsedQuery.data;

    const where: {
      role?: string;
      OR?: Array<{
        nama_lengkap?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};

    if (user.role === 'pengelola') {
      where.role = 'pengguna';
    } else if (user.role === 'admin') {
      if (role && role !== 'all') {
        where.role = role;
      }
    }

    if (search) {
      where.OR = [
        { nama_lengkap: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const data = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        no_hp: true,
        kelurahan: true,
        kecamatan: true,
        kabupaten: true,
        detail_alamat: true,
        role: true,
        saldo: true,
        profile_completed: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' }
    });

    const formatted = data.map((item) => ({
      ...item,
      saldo: Number(item.saldo ?? 0)
    }));

    return apiSuccess(formatted, { headers: NO_CACHE_HEADERS });

  } catch (error) {
    console.error('List member error:', error);
    return apiError('Internal server error', 500);
  }
}
