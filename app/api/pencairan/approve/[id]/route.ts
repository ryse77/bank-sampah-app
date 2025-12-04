import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = requireRole(request, ['admin', 'pengelola']);
  if (user instanceof Response) return user;

  try {
    const { id } = await params;
    const { status, catatan } = await request.json();

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'ID pencairan tidak valid' },
        { status: 400 }
      );
    }

    const pencairan = await prisma.pencairanSaldo.findUnique({
      where: { id },
      include: {
        user: { select: { saldo: true } }
      }
    });

    if (!pencairan) {
      return NextResponse.json(
        { error: 'Pencairan tidak ditemukan' },
        { status: 404 }
      );
    }

    if (pencairan.status !== 'pending') {
      return NextResponse.json(
        { error: 'Pencairan sudah diproses' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.pencairanSaldo.update({
        where: { id },
        data: {
          status,
          pengelola_id: user.id,
          tanggal_pencairan: new Date().toISOString(),
          catatan
        }
      });

      if (status === 'approved') {
        const currentSaldo = Number(pencairan.user?.saldo ?? 0);
        const newSaldo = currentSaldo - Number(pencairan.nominal);

        await tx.user.update({
          where: { id: pencairan.user_id },
          data: { saldo: newSaldo }
        });
      }
    });

    return NextResponse.json({
      message: `Pencairan berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`
    });

  } catch (error) {
    console.error('Approve pencairan error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
