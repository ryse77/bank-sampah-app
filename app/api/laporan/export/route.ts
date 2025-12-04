import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const user = requireRole(request, ['admin', 'pengelola']);
  if (user instanceof Response) return user;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'setoran';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let data: any[] = [];

    if (type === 'setoran') {
      const dateFilter: any = {};
      if (startDate || endDate) {
        dateFilter.tanggal_setor = {};
        if (startDate) dateFilter.tanggal_setor.gte = new Date(startDate);
        if (endDate) dateFilter.tanggal_setor.lte = new Date(endDate);
      }

      const result = await prisma.setoranSampah.findMany({
        where: dateFilter,
        include: {
          user: { select: { nama_lengkap: true, email: true } },
          pengelola: { select: { nama_lengkap: true } }
        },
        orderBy: { tanggal_setor: 'desc' }
      });

      data = result.map((item) => ({
        'Tanggal': new Date(item.tanggal_setor).toLocaleDateString('id-ID'),
        'Nama Pengguna': item.user?.nama_lengkap || '-',
        'Email': item.user?.email || '-',
        'Jenis Sampah': item.jenis_sampah,
        'Berat (kg)': item.berat_sampah !== null && item.berat_sampah !== undefined ? Number(item.berat_sampah) : '-',
        'Harga/kg': item.harga_per_kg !== null && item.harga_per_kg !== undefined ? Number(item.harga_per_kg) : '-',
        'Total': item.total_harga !== null && item.total_harga !== undefined ? Number(item.total_harga) : '-',
        'Metode': item.metode,
        'Status': item.status,
        'Pengelola': item.pengelola?.nama_lengkap || '-'
      }));

    } else if (type === 'pencairan') {
      const dateFilter: any = {};
      if (startDate || endDate) {
        dateFilter.tanggal_request = {};
        if (startDate) dateFilter.tanggal_request.gte = new Date(startDate);
        if (endDate) dateFilter.tanggal_request.lte = new Date(endDate);
      }

      const result = await prisma.pencairanSaldo.findMany({
        where: dateFilter,
        include: {
          user: { select: { nama_lengkap: true, email: true } },
          pengelola: { select: { nama_lengkap: true } }
        },
        orderBy: { tanggal_request: 'desc' }
      });

      data = result.map((item) => ({
        'Tanggal Request': new Date(item.tanggal_request).toLocaleDateString('id-ID'),
        'Nama Pengguna': item.user?.nama_lengkap || '-',
        'Email': item.user?.email || '-',
        'Nominal': Number(item.nominal),
        'Status': item.status,
        'Tanggal Pencairan': item.tanggal_pencairan ? 
          new Date(item.tanggal_pencairan).toLocaleDateString('id-ID') : '-',
        'Pengelola': item.pengelola?.nama_lengkap || '-',
        'Catatan': item.catatan || '-'
      }));
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    XLSX.utils.book_append_sheet(wb, ws, type === 'setoran' ? 'Setoran' : 'Pencairan');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=laporan-${type}-${new Date().toISOString().split('T')[0]}.xlsx`
      }
    });

  } catch (error) {
    console.error('Export laporan error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
