import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = requireRole(request, ['admin', 'pengelola']);
  if (user instanceof Response) return user;

  try {
    const { code } = await request.json();

    if (!code || code.length < 3) {
      return NextResponse.json(
        { error: 'Kode harus minimal 3 karakter' },
        { status: 400 }
      );
    }

    // Cari user berdasarkan 3 digit terakhir dari ID
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, nama_lengkap, email, saldo')
      .eq('role', 'pengguna');

    if (error) {
      throw error;
    }

    // Filter user yang ID-nya berakhiran dengan code yang dicari
    const foundUser = users?.find(u =>
      u.id.slice(-3).toUpperCase() === code.toUpperCase()
    );

    if (!foundUser) {
      return NextResponse.json(
        { error: 'Kode tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: foundUser.id,
      nama_lengkap: foundUser.nama_lengkap,
      email: foundUser.email,
      saldo: foundUser.saldo
    });

  } catch (error) {
    console.error('Search by code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
