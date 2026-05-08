import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseRequestBody } from '@/lib/validators/parse';
import { memberPasswordUpdateSchema } from '@/lib/validators/api';
import { apiError, apiSuccess } from '@/lib/http/response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(
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

    const parsed = await parseRequestBody(request, memberPasswordUpdateSchema);
    if (!parsed.success) {
      return apiError(parsed.error, 400);
    }
    const { password } = parsed.data;

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true }
    });

    if (!targetUser) {
      return apiError('User tidak ditemukan', 404);
    }

    if (targetUser.role === 'admin') {
      return apiError('Tidak dapat mengubah password akun admin', 403);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    return apiSuccess({
      message: 'Password berhasil diperbarui'
    });
  } catch (error) {
    console.error('Update password member error:', error);
    return apiError('Internal server error', 500);
  }
}
