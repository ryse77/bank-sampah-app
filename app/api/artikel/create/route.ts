import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/http/response';
import { parseRequestBody } from '@/lib/validators/parse';
import { artikelCreateSchema } from '@/lib/validators/api';

const normalizeArtikelGambar = (gambar: unknown): string | null | undefined => {
  if (gambar === undefined) return undefined;
  if (gambar === null) return null;
  if (typeof gambar === 'object') return JSON.stringify(gambar);
  return gambar;
};

export async function POST(request: NextRequest) {
  const user = requireRole(request, ['admin']);
  if (user instanceof Response) return user;

  try {
    const parsed = await parseRequestBody(request, artikelCreateSchema);
    if (!parsed.success) {
      return apiError(parsed.error, 400);
    }

    const { judul, konten, gambar } = parsed.data;
    const gambarData = normalizeArtikelGambar(gambar);

    const data = await prisma.artikel.create({
      data: {
        judul,
        konten,
        gambar: gambarData ?? null,
        admin_id: user.id
      }
    });

    return apiSuccess({
      message: 'Artikel berhasil dibuat',
      data
    }, 201);
  } catch (error) {
    console.error('Create artikel error:', error);
    return apiError('Internal server error', 500);
  }
}
