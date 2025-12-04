import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = requireRole(request, ['admin']);
  if (user instanceof Response) return user;

  try {
    const members = await prisma.user.findMany({
      where: { role: 'pengguna' },
      select: {
        nama_lengkap: true,
        email: true,
        no_hp: true,
        saldo: true,
        created_at: true,
        profile_completed: true,
      },
      orderBy: { created_at: 'desc' }
    });

    const data = members.map((m) => ({
      Nama: m.nama_lengkap,
      Email: m.email,
      'Nomor HP': m.no_hp || '',
      'Saldo': Number(m.saldo ?? 0),
      'Profile Lengkap': m.profile_completed ? 'Ya' : 'Belum',
      'Tanggal Dibuat': new Date(m.created_at).toLocaleString('id-ID'),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Member');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=member-${new Date().toISOString().split('T')[0]}.xlsx`
      }
    });
  } catch (error) {
    console.error('Export member error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
