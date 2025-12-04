import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// CRITICAL: Force dynamic rendering - disable ALL caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const user = requireRole(request, ['admin', 'pengelola']);
  if (user instanceof Response) return user;

  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const where: any = {};

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

    return NextResponse.json(formatted, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error('List member error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
