import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// CRITICAL: Force dynamic rendering - disable ALL caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ensure no static caching

export async function GET(request: NextRequest) {
  const user = requireAuth(request);
  if (user instanceof Response) return user;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, any> = {};
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

    return NextResponse.json(formatted, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error('List pencairan error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
