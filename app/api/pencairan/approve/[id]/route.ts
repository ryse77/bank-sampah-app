import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseRequestBody } from '@/lib/validators/parse';
import { pencairanApproveSchema } from '@/lib/validators/api';
import { apiError, apiSuccess } from '@/lib/http/response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = requireRole(request, ['admin', 'pengelola']);
  if (user instanceof Response) return user;

  try {
    const { id } = await params;
    const parsed = await parseRequestBody(request, pencairanApproveSchema, 'Status tidak valid');
    if (!parsed.success) {
      return apiError(parsed.error, 400);
    }
    const { status, catatan } = parsed.data;

    if (!id) {
      return apiError('ID pencairan tidak valid', 400);
    }

    await prisma.$transaction(async (tx) => {
      const pencairan = await tx.pencairanSaldo.findUnique({
        where: { id },
        select: { id: true, user_id: true, nominal: true, status: true }
      });

      if (!pencairan) {
        throw new Error('PENCAIRAN_NOT_FOUND');
      }

      if (pencairan.status !== 'pending') {
        throw new Error('PENCAIRAN_ALREADY_PROCESSED');
      }

      const updatedPencairan = await tx.pencairanSaldo.updateMany({
        where: { id, status: 'pending' },
        data: {
          status,
          pengelola_id: user.id,
          tanggal_pencairan: new Date(),
          catatan
        }
      });

      if (updatedPencairan.count !== 1) {
        throw new Error('PENCAIRAN_ALREADY_PROCESSED');
      }

      if (status === 'approved') {
        const saldoUpdate = await tx.user.updateMany({
          where: {
            id: pencairan.user_id,
            saldo: { gte: pencairan.nominal }
          },
          data: {
            saldo: { decrement: pencairan.nominal }
          }
        });

        if (saldoUpdate.count !== 1) {
          throw new Error('INSUFFICIENT_SALDO');
        }
      }
    });

    return apiSuccess({
      message: `Pencairan berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`
    });

  } catch (error: unknown) {
    console.error('Approve pencairan error:', error);
    if (error instanceof Error && error.message === 'PENCAIRAN_NOT_FOUND') {
      return apiError('Pencairan tidak ditemukan', 404);
    }
    if (error instanceof Error && error.message === 'PENCAIRAN_ALREADY_PROCESSED') {
      return apiError('Pencairan sudah diproses', 409);
    }
    if (error instanceof Error && error.message === 'INSUFFICIENT_SALDO') {
      return apiError('Saldo tidak mencukupi', 400);
    }
    return apiError('Internal server error', 500);
  }
}
