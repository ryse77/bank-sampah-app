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
    const where: Record<string, any> = {};
    if (user.role === 'pengguna') {
      where.user_id = user.id;
    }

    const data = await prisma.setoranSampah.findMany({
      where,
      include: {
        user: {
          select: { nama_lengkap: true, email: true, no_hp: true }
        },
        pengelola: {
          select: { nama_lengkap: true }
        }
      },
      orderBy: { tanggal_setor: 'desc' }
    });

    const formatted = data.map(({ user: userData, pengelola, ...rest }) => ({
      ...rest,
      berat_sampah: rest.berat_sampah !== null && rest.berat_sampah !== undefined ? Number(rest.berat_sampah) : null,
      harga_per_kg: rest.harga_per_kg !== null && rest.harga_per_kg !== undefined ? Number(rest.harga_per_kg) : null,
      total_harga: rest.total_harga !== null && rest.total_harga !== undefined ? Number(rest.total_harga) : null,
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
    console.error('List setoran error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
