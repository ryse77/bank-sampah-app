import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ImportRow {
  nama_lengkap?: string;
  email?: string;
  password?: string;
  no_hp?: string;
  saldo_default?: number | string;
}

export async function POST(request: NextRequest) {
  const user = requireRole(request, ['admin']);
  if (user instanceof Response) return user;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rows: ImportRow[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data di file' }, { status: 400 });
    }

    const successes: string[] = [];
    const errors: Array<{ row: number; email?: string; error: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // header on row 1

      const nama = (row.nama_lengkap || '').toString().trim();
      const email = (row.email || '').toString().trim().toLowerCase();
      const password = (row.password || '').toString();
      const no_hp = (row.no_hp || '').toString().trim();
      const saldoRaw = row.saldo_default ?? 0;

      const saldo = typeof saldoRaw === 'number'
        ? saldoRaw
        : parseFloat(saldoRaw.toString().replace(/[^0-9.-]/g, ''));

      if (!nama || !email || !password) {
        errors.push({ row: rowNumber, email, error: 'Nama, email, dan password wajib diisi' });
        continue;
      }

      if (!email.includes('@')) {
        errors.push({ row: rowNumber, email, error: 'Format email tidak valid' });
        continue;
      }

      if (password.length < 8) {
        errors.push({ row: rowNumber, email, error: 'Password minimal 8 karakter' });
        continue;
      }

      const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      });

      if (existing) {
        errors.push({ row: rowNumber, email, error: 'Email sudah terdaftar' });
        continue;
      }

      const hashed = await bcrypt.hash(password, 10);
      const qrData = `BANKSAMPAH-${email}-${Date.now()}`;
      const qrCodeImage = await QRCode.toDataURL(qrData);

      try {
        await prisma.user.create({
          data: {
            nama_lengkap: nama,
            email,
            password: hashed,
            no_hp: no_hp || null,
            saldo: saldo || 0,
            role: 'pengguna',
            qr_code: qrCodeImage,
            qr_data: qrData,
            profile_completed: false,
          }
        });
        successes.push(email);
      } catch (err: any) {
        errors.push({ row: rowNumber, email, error: err.message || 'Gagal menyimpan' });
      }
    }

    return NextResponse.json({
      message: 'Import selesai',
      total: rows.length,
      success: successes.length,
      failed: errors.length,
      errors,
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
