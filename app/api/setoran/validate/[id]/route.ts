import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = requireRole(request, ['admin', 'pengelola']);
  if (user instanceof Response) return user;

  try {
    const { id } = await params;
    const { berat_sampah, harga_per_kg } = await request.json();

    if (!berat_sampah || !harga_per_kg) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'ID setoran tidak valid' },
        { status: 400 }
      );
    }

    const berat = parseFloat(berat_sampah);
    const hargaKg = parseFloat(harga_per_kg);
    const total_harga = berat * hargaKg;

    const setoran = await prisma.setoranSampah.update({
      where: { id },
      data: {
        berat_sampah: berat,
        harga_per_kg: hargaKg,
        total_harga,
        status: 'validated',
        pengelola_id: user.id,
        tanggal_validasi: new Date().toISOString()
      },
      select: { user_id: true }
    });

    if (!setoran || !setoran.user_id) {
      return NextResponse.json(
        { error: 'Setoran tidak ditemukan atau user_id tidak valid' },
        { status: 400 }
      );
    }

    const userData = await prisma.user.findUnique({
      where: { id: setoran.user_id },
      select: { saldo: true }
    });

    if (!userData) {
      console.error('Get user error: user not found');
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 400 }
      );
    }

    const newSaldo = Number(userData.saldo ?? 0) + total_harga;

    await prisma.user.update({
      where: { id: setoran.user_id },
      data: { saldo: newSaldo }
    });

    return NextResponse.json({
      message: 'Setoran berhasil divalidasi',
      total_harga
    });

  } catch (error) {
    console.error('Validate setoran error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Setoran tidak ditemukan' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
