import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// CRITICAL: Force dynamic rendering - disable ALL caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const user = requireAuth(request);
  if (user instanceof Response) return user;

  try {
    // Fetch latest user data from database
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    const { password, saldo, ...rest } = userData;
    const userWithoutPassword = {
      ...rest,
      saldo: Number(saldo ?? 0),
      profile_completed: userData.profile_completed,
    };

    return NextResponse.json({
      user: userWithoutPassword
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
