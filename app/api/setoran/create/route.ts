import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const user = requireAuth(request);
  if (user instanceof Response) return user;

  try {
    const { jenis_sampah, metode } = await request.json();

    if (!jenis_sampah || !metode) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    const data = await prisma.setoranSampah.create({
      data: {
        user_id: user.id,
        jenis_sampah,
        metode,
        status: 'pending'
      }
    });

    return NextResponse.json({
      message: 'Setoran berhasil dibuat',
      data
    }, { status: 201 });

  } catch (error) {
    console.error('Create setoran error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
