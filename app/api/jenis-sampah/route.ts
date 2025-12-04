import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get all jenis sampah
export async function GET(request: NextRequest) {
  try {
    // Allow all authenticated users to view
    const user = requireRole(request, ['admin', 'pengelola', 'pengguna']);
    if (user instanceof Response) return user;

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const data = await prisma.jenisSampah.findMany({
      where: activeOnly ? { is_active: true } : undefined,
      orderBy: { nama: 'asc' }
    });

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Jenis sampah API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new jenis sampah (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, ['admin']);
    if (user instanceof Response) return user;

    const body = await request.json();
    const { nama, is_active } = body;

    if (!nama) {
      return NextResponse.json(
        { error: 'Nama jenis sampah diperlukan' },
        { status: 400 }
      );
    }

    // Check if jenis sampah with same name already exists
    const existing = await prisma.jenisSampah.findUnique({
      where: { nama }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Jenis sampah dengan nama ini sudah ada' },
        { status: 400 }
      );
    }

    const data = await prisma.jenisSampah.create({
      data: {
        nama,
        is_active: is_active !== undefined ? is_active : true,
      }
    });

    return NextResponse.json({
      message: 'Jenis sampah berhasil ditambahkan',
      data
    });

  } catch (error: any) {
    console.error('Create jenis sampah error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

// PUT - Update jenis sampah (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = requireRole(request, ['admin']);
    if (user instanceof Response) return user;

    const body = await request.json();
    const { id, nama, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID diperlukan untuk update' },
        { status: 400 }
      );
    }

    // Get current data first
    const currentData = await prisma.jenisSampah.findUnique({
      where: { id },
      select: { nama: true }
    });

    if (!currentData) {
      return NextResponse.json(
        { error: 'Jenis sampah tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if updating to a name that already exists (excluding current item)
    if (nama && nama !== currentData.nama) {
      const existing = await prisma.jenisSampah.findFirst({
        where: {
          nama,
          NOT: { id }
        },
        select: { id: true }
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Jenis sampah dengan nama ini sudah ada' },
          { status: 400 }
        );
      }

      // Update all setoran_sampah records that use the old name
      await prisma.setoranSampah.updateMany({
        where: { jenis_sampah: currentData.nama },
        data: { jenis_sampah: nama }
      });
    }

    const updateData: any = {};
    if (nama !== undefined) updateData.nama = nama;
    if (is_active !== undefined) updateData.is_active = is_active;

    const data = await prisma.jenisSampah.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Jenis sampah berhasil diupdate',
      data
    });

  } catch (error: any) {
    console.error('Update jenis sampah error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE - Delete jenis sampah (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const user = requireRole(request, ['admin']);
    if (user instanceof Response) return user;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID diperlukan untuk delete' },
        { status: 400 }
      );
    }

    // Get jenis sampah name first
    const jenisSampahData = await prisma.jenisSampah.findUnique({
      where: { id },
      select: { nama: true }
    });

    if (!jenisSampahData) {
      return NextResponse.json(
        { error: 'Jenis sampah tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if this jenis_sampah is used in any setoran_sampah
    // The jenis_sampah column in setoran_sampah stores the name, not the ID
    const setoranCheck = await prisma.setoranSampah.findFirst({
      where: { jenis_sampah: jenisSampahData.nama },
      select: { id: true }
    });

    if (setoranCheck) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus jenis sampah yang sudah digunakan dalam transaksi. Nonaktifkan saja.' },
        { status: 400 }
      );
    }

    // Delete the jenis_sampah
    await prisma.jenisSampah.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Jenis sampah berhasil dihapus'
    });

  } catch (error: any) {
    console.error('Delete jenis sampah error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
