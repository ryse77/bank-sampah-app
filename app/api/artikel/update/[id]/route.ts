import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/http/response';
import { parseRequestBody } from '@/lib/validators/parse';
import { artikelUpdateSchema } from '@/lib/validators/api';

const normalizeArtikelGambar = (gambar: unknown): string | null | undefined => {
  if (gambar === undefined) return undefined;
  if (gambar === null) return null;
  if (typeof gambar === 'object') return JSON.stringify(gambar);
  if (typeof gambar === 'string') return gambar;
  return undefined;
};

export async function PUT(
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

    const parsed = await parseRequestBody(request, artikelUpdateSchema);
    if (!parsed.success) {
      return apiError(parsed.error, 400);
    }

    const { judul, konten, gambar } = parsed.data;
    const updateData: { judul?: string; konten?: string; gambar?: string | null } = {};
    if (judul !== undefined) updateData.judul = judul;
    if (konten !== undefined) updateData.konten = konten;
    if (gambar !== undefined) updateData.gambar = normalizeArtikelGambar(gambar);

    const data = await prisma.artikel.update({
      where: { id },
      data: updateData
    });

    return apiSuccess({
      message: 'Artikel berhasil diupdate',
      data
    });
  } catch (error) {
    console.error('Update artikel error:', error);
    return apiError('Internal server error', 500);
  }
}
