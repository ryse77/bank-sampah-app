import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = requireRole(request, ['admin']);
  if (user instanceof Response) return user;

  const sample = [
    {
      nama_lengkap: 'Nama Contoh',
      email: 'user@example.com',
      password: 'password123',
      no_hp: '081234567890',
      saldo_default: 0,
    },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sample);
  XLSX.utils.book_append_sheet(wb, ws, 'Template');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=template-import-member.xlsx',
    },
  });
}
