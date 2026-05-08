import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/http/response';

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
    // Fetch latest user data from database
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userData) {
      return apiError('User tidak ditemukan', 404);
    }

    const { saldo, ...rest } = userData;
    const userWithoutPassword = {
      ...rest,
      saldo: Number(saldo ?? 0),
      profile_completed: userData.profile_completed,
    };

    return apiSuccess({
      user: userWithoutPassword
    }, { headers: NO_CACHE_HEADERS });

  } catch (error) {
    console.error('Get user error:', error);
    return apiError('Internal server error', 500);
  }
}
