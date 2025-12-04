import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = requireRole(request, ['admin', 'pengelola']);
  if (user instanceof Response) return user;

  const { id } = await params;

  try {
    // Get user data
    const userData = await prisma.user.findUnique({
      where: { id }
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'Member tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get setoran history
    const setoranData = await prisma.setoranSampah.findMany({
      where: { user_id: id },
      orderBy: { tanggal_setor: 'desc' },
      take: 10
    });

    // Get pencairan history
    const pencairanData = await prisma.pencairanSaldo.findMany({
      where: { user_id: id },
      orderBy: { tanggal_request: 'desc' },
      take: 10
    });

    // Calculate stats
    const totalSetoran = setoranData?.length || 0;
    const totalValidated = setoranData?.filter(s => s.status === 'validated').length || 0;
    const totalPencairan = pencairanData?.filter(p => p.status === 'approved').reduce(
      (sum, p) => sum + Number(p.nominal), 0
    ) || 0;

    const sanitizedUser = {
      ...userData,
      password: undefined,
      saldo: Number(userData.saldo ?? 0)
    };

    const setoranResponse = setoranData.map((s) => ({
      ...s,
      berat_sampah: s.berat_sampah !== null && s.berat_sampah !== undefined ? Number(s.berat_sampah) : null,
      harga_per_kg: s.harga_per_kg !== null && s.harga_per_kg !== undefined ? Number(s.harga_per_kg) : null,
      total_harga: s.total_harga !== null && s.total_harga !== undefined ? Number(s.total_harga) : null,
    }));

    const pencairanResponse = pencairanData.map((p) => ({
      ...p,
      nominal: Number(p.nominal)
    }));

    return NextResponse.json({
      user: sanitizedUser,
      stats: {
        totalSetoran,
        totalValidated,
        totalPencairan
      },
      recentSetoran: setoranResponse,
      recentPencairan: pencairanResponse
    });

  } catch (error) {
    console.error('Member detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
