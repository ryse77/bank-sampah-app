import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireRole } from '@/lib/auth';

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
    let foundUser = null;
    let searchError = null;

    // STEP 1: Cari dengan qr_data exact match
    const { data: exactMatch, error: exactError } = await supabaseAdmin
      .from('users')
      .select('id, nama_lengkap, email, saldo, qr_code')
      .eq('qr_data', qr_data)
      .eq('role', 'pengguna')
      .maybeSingle();

    if (exactMatch) {
      foundUser = exactMatch;
      console.log('[SCAN] Found user with exact qr_data match');
    } else {
      // STEP 2: Extract email dari QR code format lama (USER-timestamp-email atau BANKSAMPAH-email-timestamp)
      let extractedEmail = null;

      // Format: USER-1762672649276-roy.yulis77@gmail.com
      if (qr_data.startsWith('USER-')) {
        const parts = qr_data.split('-');
        if (parts.length >= 3) {
          extractedEmail = parts.slice(2).join('-'); // Handle email dengan dash
        }
      }
      // Format: BANKSAMPAH-roy.yulis77@gmail.com-1762672649276
      else if (qr_data.startsWith('BANKSAMPAH-')) {
        const parts = qr_data.split('-');
        if (parts.length >= 3) {
          // Email adalah bagian tengah (antara BANKSAMPAH dan timestamp)
          extractedEmail = parts.slice(1, -1).join('-');
        }
      }

      console.log('[SCAN] Extracted email from qr_data:', extractedEmail);

      // STEP 3: Cari berdasarkan email yang di-extract
      if (extractedEmail) {
        const { data: emailMatch, error: emailError } = await supabaseAdmin
          .from('users')
          .select('id, nama_lengkap, email, saldo, qr_code, qr_data')
          .eq('email', extractedEmail)
          .eq('role', 'pengguna')
          .maybeSingle();

        if (emailMatch) {
          foundUser = emailMatch;
          console.log('[SCAN] Found user with email match');

          // BONUS: Auto-update qr_data di database agar next time langsung match
          await supabaseAdmin
            .from('users')
            .update({ qr_data: qr_data })
            .eq('id', emailMatch.id);

          console.log('[SCAN] Auto-updated qr_data in database for user:', emailMatch.email);
        } else {
          searchError = emailError;
        }
      } else {
        searchError = exactError;
      }
    }

    if (!foundUser) {
      console.error('[SCAN] User not found for qr_data:', qr_data);
      console.error('[SCAN] Database error:', searchError);

      // Additional debugging: Check if user exists with similar qr_data
      const { data: allUsers } = await supabaseAdmin
        .from('users')
        .select('id, email, qr_data')
        .eq('role', 'pengguna')
        .limit(5);

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
      saldo: foundUser.saldo
    });

  } catch (error) {
    console.error('Scan QR error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
