import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/http/response';
import { parseRequestBody } from '@/lib/validators/parse';
import { profileCompleteSchema } from '@/lib/validators/api';

export async function POST(request: NextRequest) {
  const user = requireAuth(request);
  if (user instanceof Response) return user;

  if (user.role !== 'pengguna') {
    return apiError('Hanya member yang perlu melengkapi profil', 403);
  }

  try {
    const parsed = await parseRequestBody(request, profileCompleteSchema);
    if (!parsed.success) {
      return apiError(parsed.error, 400);
    }
    const { no_hp, kelurahan, kecamatan, kabupaten, detail_alamat } = parsed.data;

    const data: {
      profile_completed: boolean;
      no_hp?: string | null;
      kelurahan?: string | null;
      kecamatan?: string | null;
      kabupaten?: string | null;
      detail_alamat?: string | null;
    } = { profile_completed: true };
    if (no_hp !== undefined) data.no_hp = no_hp || null;
    if (kelurahan !== undefined) data.kelurahan = kelurahan || null;
    if (kecamatan !== undefined) data.kecamatan = kecamatan || null;
    if (kabupaten !== undefined) data.kabupaten = kabupaten || null;
    if (detail_alamat !== undefined) data.detail_alamat = detail_alamat || null;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        role: true,
        saldo: true,
        qr_code: true,
        profile_completed: true,
        no_hp: true,
        kelurahan: true,
        kecamatan: true,
        kabupaten: true,
        detail_alamat: true,
      }
    });

    return apiSuccess({
      message: 'Profil berhasil dilengkapi',
      user: {
        ...updated,
        saldo: Number(updated.saldo ?? 0),
      }
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    return apiError('Internal server error', 500);
  }
}
