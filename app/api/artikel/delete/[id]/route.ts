import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/http/response';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = requireRole(request, ['admin']);
  if (user instanceof Response) return user;

  try {
    const { id } = await params;
    if (!id) {
      return apiError('ID artikel tidak valid', 400);
    }

    await prisma.artikel.delete({
      where: { id }
    });

    return apiSuccess({
      message: 'Artikel berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete artikel error:', error);
    return apiError('Internal server error', 500);
  }
}
