import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const user = requireAuth(request);
  if (user instanceof Response) return user;

  try {
    const { nominal } = await request.json();

    if (!nominal || nominal <= 0) {
      return NextResponse.json(
        { error: 'Nominal tidak valid' },
        { status: 400 }
      );
    }

    // Check saldo user
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { saldo: true }
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    if (Number(userData.saldo ?? 0) < nominal) {
      return NextResponse.json(
        { error: 'Saldo tidak mencukupi' },
        { status: 400 }
      );
    }

    // Create pencairan request
    const data = await prisma.pencairanSaldo.create({
      data: {
        user_id: user.id,
        nominal,
        status: 'pending'
      }
    });

    return NextResponse.json({
      message: 'Permintaan pencairan berhasil dibuat',
      data: {
        ...data,
        nominal: Number(data.nominal)
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Request pencairan error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
