import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/http/response';
import { artikelListQuerySchema } from '@/lib/validators/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsedQuery = artikelListQuerySchema.safeParse({
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined
    });
    if (!parsedQuery.success) {
      return apiError(parsedQuery.error.issues[0]?.message || 'Query tidak valid', 400);
    }

    const { limit: take, offset: skip } = parsedQuery.data;

    const [data, count] = await Promise.all([
      prisma.artikel.findMany({
        include: {
          admin: { select: { nama_lengkap: true } }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take
      }),
      prisma.artikel.count()
    ]);

    return apiSuccess({
      data,
      pagination: {
        total: count,
        limit: take,
        offset: skip
      }
    });

  } catch (error) {
    console.error('List artikel error:', error);
    return apiError('Internal server error', 500);
  }
}
