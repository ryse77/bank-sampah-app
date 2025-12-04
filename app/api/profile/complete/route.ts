import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const user = requireAuth(request);
  if (user instanceof Response) return user;

  if (user.role !== 'pengguna') {
    return NextResponse.json({ error: 'Hanya member yang perlu melengkapi profil' }, { status: 403 });
  }

  try {
    const { no_hp, kelurahan, kecamatan, kabupaten, detail_alamat } = await request.json();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        no_hp: no_hp || null,
        kelurahan: kelurahan || null,
        kecamatan: kecamatan || null,
        kabupaten: kabupaten || null,
        detail_alamat: detail_alamat || null,
        profile_completed: true,
      },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        role: true,
        saldo: true,
        qr_code: true,
        profile_completed: true,
      }
    });

    return NextResponse.json({
      message: 'Profil berhasil dilengkapi',
      user: {
        ...updated,
        saldo: Number(updated.saldo ?? 0),
      }
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
