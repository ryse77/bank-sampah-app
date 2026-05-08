import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseRequestBody } from '@/lib/validators/parse';
import { setoranValidateSchema } from '@/lib/validators/api';
import { apiError, apiSuccess } from '@/lib/http/response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = requireRole(request, ['admin', 'pengelola']);
  if (user instanceof Response) return user;

  try {
    const { id } = await params;
    const parsed = await parseRequestBody(request, setoranValidateSchema, 'Data tidak lengkap');
    if (!parsed.success) {
      return apiError(parsed.error, 400);
    }
    const { berat_sampah } = parsed.data;

    if (!id) {
      return apiError('ID setoran tidak valid', 400);
    }

    const berat = berat_sampah;
    const setoranResult = await prisma.$transaction(async (tx) => {
      const existing = await tx.setoranSampah.findUnique({
        where: { id },
        select: { id: true, user_id: true, status: true, jenis_sampah: true }
      });

      if (!existing) {
        throw new Error('SETORAN_NOT_FOUND');
      }

      if (existing.status !== 'pending') {
        throw new Error('SETORAN_ALREADY_PROCESSED');
      }

      const jenisSampah = await tx.jenisSampah.findFirst({
        where: { nama: existing.jenis_sampah },
        select: { harga_per_kg: true }
      });
      if (!jenisSampah) {
        throw new Error('JENIS_SAMPAH_NOT_FOUND');
      }

      const hargaKg = Number(jenisSampah.harga_per_kg);
      const total_harga = berat * hargaKg;

      const updateResult = await tx.setoranSampah.updateMany({
        where: { id, status: 'pending' },
        data: {
          berat_sampah: berat,
          harga_per_kg: hargaKg,
          total_harga,
          status: 'validated',
          pengelola_id: user.id,
          tanggal_validasi: new Date()
        }
      });

      if (updateResult.count !== 1) {
        throw new Error('SETORAN_ALREADY_PROCESSED');
      }

      await tx.user.update({
        where: { id: existing.user_id },
        data: { saldo: { increment: total_harga } }
      });

      return { user_id: existing.user_id, total_harga };
    });

    return apiSuccess({
      message: 'Setoran berhasil divalidasi',
      total_harga: setoranResult.total_harga,
      user_id: setoranResult.user_id
    });

  } catch (error: unknown) {
    console.error('Validate setoran error:', error);
    if (error instanceof Error && error.message === 'SETORAN_NOT_FOUND') {
      return apiError('Setoran tidak ditemukan', 404);
    }
    if (error instanceof Error && error.message === 'SETORAN_ALREADY_PROCESSED') {
      return apiError('Setoran sudah diproses sebelumnya', 409);
    }
    if (error instanceof Error && error.message === 'JENIS_SAMPAH_NOT_FOUND') {
      return apiError('Jenis sampah tidak ditemukan', 400);
    }
    return apiError('Internal server error', 500);
  }
}
