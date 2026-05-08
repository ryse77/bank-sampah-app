import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseRequestBody } from '@/lib/validators/parse';
import { memberScanSchema } from '@/lib/validators/api';
import { apiError, apiSuccess } from '@/lib/http/response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const user = requireRole(request, ['admin', 'pengelola']);
  if (user instanceof Response) return user;

  try {
    const parsed = await parseRequestBody(request, memberScanSchema);
    if (!parsed.success) {
      return apiError(parsed.error, 400);
    }

    const { qr_data } = parsed.data;

    console.log('[SCAN] Received qr_data:', qr_data);

    let foundUser = await prisma.user.findFirst({
      where: {
        qr_data,
        role: 'pengguna'
      },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        saldo: true,
        qr_code: true,
        qr_data: true
      }
    });

    if (!foundUser) {
      let extractedEmail: string | null = null;

      if (qr_data.startsWith('USER-')) {
        const parts = qr_data.split('-');
        if (parts.length >= 3) {
          extractedEmail = parts.slice(2).join('-');
        }
      } else if (qr_data.startsWith('BANKSAMPAH-')) {
        const parts = qr_data.split('-');
        if (parts.length >= 3) {
          extractedEmail = parts.slice(1, -1).join('-');
        }
      }

      console.log('[SCAN] Extracted email from qr_data:', extractedEmail);

      if (extractedEmail) {
        const emailMatch = await prisma.user.findFirst({
          where: {
            email: extractedEmail,
            role: 'pengguna'
          },
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            saldo: true,
            qr_code: true,
            qr_data: true
          }
        });

        if (emailMatch) {
          foundUser = emailMatch;
          console.log('[SCAN] Found user with email match');

          if (emailMatch.qr_data !== qr_data) {
            await prisma.user.update({
              where: { id: emailMatch.id },
              data: { qr_data }
            });
            console.log('[SCAN] Auto-updated qr_data in database for user:', emailMatch.email);
          }
        }
      }
    }

    if (!foundUser) {
      console.error('[SCAN] User not found for qr_data:', qr_data);

      const allUsers = await prisma.user.findMany({
        where: { role: 'pengguna' },
        select: { id: true, email: true, qr_data: true },
        take: 5
      });

      console.error('[SCAN] Sample users in database:', allUsers);

      return apiError('User tidak ditemukan', 404);
    }

    console.log('[SCAN] User found:', foundUser.nama_lengkap, foundUser.email);

    return apiSuccess({
      id: foundUser.id,
      nama_lengkap: foundUser.nama_lengkap,
      email: foundUser.email,
      saldo: Number(foundUser.saldo ?? 0)
    });

  } catch (error) {
    console.error('Scan QR error:', error);
    return apiError('Internal server error', 500);
  }
}
