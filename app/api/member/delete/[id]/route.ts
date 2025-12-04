import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication and check if user is admin
    const user = requireRole(request, ['admin']);
    if (user instanceof Response) {
      return user;
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    // Cek apakah user ada
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cegah penghapusan akun admin
    if (targetUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus akun admin' },
        { status: 403 }
      );
    }

    await prisma.$transaction([
      prisma.setoranSampah.deleteMany({ where: { user_id: id } }),
      prisma.pencairanSaldo.deleteMany({ where: { user_id: id } }),
      prisma.user.delete({ where: { id } })
    ]);

    return NextResponse.json({
      message: 'Akun berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
