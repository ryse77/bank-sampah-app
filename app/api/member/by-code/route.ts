import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { searchByCodeSchema } from '@/lib/validators/api';
import { parseRequestBody } from '@/lib/validators/parse';
import { apiError, apiSuccess } from '@/lib/http/response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const user = requireRole(request, ['admin', 'pengelola']);
  if (user instanceof Response) return user;

  try {
    const parsed = await parseRequestBody(request, searchByCodeSchema, 'Kode tidak valid');
    if (!parsed.success) {
      return apiError(parsed.error, 400);
    }
    const { code } = parsed.data;

    const normalizedCode = code.toLowerCase();

    const foundUser = await prisma.$queryRaw<Array<{
      id: string;
      nama_lengkap: string;
      email: string;
      saldo: Prisma.Decimal;
    }>>`
      SELECT id, nama_lengkap, email, saldo
      FROM users
      WHERE role = 'pengguna'
        AND right(lower(id::text), length(${normalizedCode})) = ${normalizedCode}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (foundUser.length === 0) {
      return apiError('Kode tidak ditemukan', 404);
    }
    const member = foundUser[0];

    return apiSuccess({
      id: member.id,
      nama_lengkap: member.nama_lengkap,
      email: member.email,
      saldo: Number(member.saldo ?? 0)
    });

  } catch (error) {
    console.error('Search by code error:', error);
    return apiError('Internal server error', 500);
  }
}
