import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const user = requireRole(request, ['admin', 'pengelola']);
  if (user instanceof Response) return user;

  try {
    const { qr_data } = await request.json();

    if (!qr_data) {
      return NextResponse.json(
        { error: 'QR data diperlukan' },
        { status: 400 }
      );
    }

    console.log('[SCAN] Received qr_data:', qr_data);

    // Cari user berdasarkan qr_data (bukan qr_code yang berisi image)
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
      // STEP 2: Extract email dari QR code format lama (USER-timestamp-email atau BANKSAMPAH-email-timestamp)
      let extractedEmail: string | null = null;

      if (qr_data.startsWith('USER-')) {
        const parts = qr_data.split('-');
        if (parts.length >= 3) {
          extractedEmail = parts.slice(2).join('-'); // Handle email dengan dash
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

      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    console.log('[SCAN] User found:', foundUser.nama_lengkap, foundUser.email);

    return NextResponse.json({
      id: foundUser.id,
      nama_lengkap: foundUser.nama_lengkap,
      email: foundUser.email,
      saldo: Number(foundUser.saldo ?? 0)
    });

  } catch (error) {
    console.error('Scan QR error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
