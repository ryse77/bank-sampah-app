import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/http/response';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireRole(request, ['admin']);
    if (user instanceof Response) {
      return user;
    }

    const { id } = await params;

    if (!id) {
      return apiError('User ID diperlukan', 400);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true }
    });

    if (!targetUser) {
      return apiError('User tidak ditemukan', 404);
    }

    if (targetUser.role === 'admin') {
      return apiError('Tidak dapat menghapus akun admin', 403);
    }

    await prisma.$transaction([
      prisma.setoranSampah.deleteMany({ where: { user_id: id } }),
      prisma.pencairanSaldo.deleteMany({ where: { user_id: id } }),
      prisma.user.delete({ where: { id } })
    ]);

    return apiSuccess({
      message: 'Akun berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return apiError('Internal server error', 500);
  }
}
