import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/http/response';
import {
  jenisSampahCreateSchema,
  jenisSampahDeleteQuerySchema,
  jenisSampahListQuerySchema,
  jenisSampahUpdateSchema
} from '@/lib/validators/api';
import { parseRequestBody } from '@/lib/validators/parse';

export async function GET(request: NextRequest) {
  try {
    const user = requireRole(request, ['admin', 'pengelola', 'pengguna']);
    if (user instanceof Response) return user;

    const { searchParams } = new URL(request.url);
    const parsedQuery = jenisSampahListQuerySchema.safeParse({
      active: searchParams.get('active') ?? undefined
    });
    if (!parsedQuery.success) {
      return apiError(parsedQuery.error.issues[0]?.message || 'Query tidak valid', 400);
    }

    const activeOnly = parsedQuery.data.active === 'true';
    const data = await prisma.jenisSampah.findMany({
      where: activeOnly ? { is_active: true } : undefined,
      orderBy: { nama: 'asc' }
    });

    return apiSuccess({
      data: data.map((item) => ({
        ...item,
        harga_per_kg: Number(item.harga_per_kg)
      }))
    });
  } catch (error) {
    console.error('Jenis sampah API error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, ['admin']);
    if (user instanceof Response) return user;

    const parsed = await parseRequestBody(request, jenisSampahCreateSchema);
    if (!parsed.success) {
      return apiError(parsed.error, 400);
    }
    const { nama, harga_per_kg, is_active } = parsed.data;

    const existing = await prisma.jenisSampah.findUnique({ where: { nama } });
    if (existing) {
      return apiError('Jenis sampah dengan nama ini sudah ada', 400);
    }

    const data = await prisma.jenisSampah.create({
      data: {
        nama,
        harga_per_kg,
        is_active: is_active !== undefined ? is_active : true
      }
    });

    return apiSuccess({
      message: 'Jenis sampah berhasil ditambahkan',
      data: { ...data, harga_per_kg: Number(data.harga_per_kg) }
    });
  } catch (error) {
    console.error('Create jenis sampah error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = requireRole(request, ['admin']);
    if (user instanceof Response) return user;

    const parsed = await parseRequestBody(request, jenisSampahUpdateSchema);
    if (!parsed.success) {
      return apiError(parsed.error, 400);
    }
    const { id, nama, harga_per_kg, is_active } = parsed.data;

    const currentData = await prisma.jenisSampah.findUnique({
      where: { id },
      select: { nama: true }
    });
    if (!currentData) {
      return apiError('Jenis sampah tidak ditemukan', 404);
    }

    if (nama && nama !== currentData.nama) {
      const existing = await prisma.jenisSampah.findFirst({
        where: { nama, NOT: { id } },
        select: { id: true }
      });
      if (existing) {
        return apiError('Jenis sampah dengan nama ini sudah ada', 400);
      }

      await prisma.setoranSampah.updateMany({
        where: { jenis_sampah: currentData.nama },
        data: { jenis_sampah: nama }
      });
    }

    const updateData: { nama?: string; harga_per_kg?: number; is_active?: boolean } = {};
    if (nama !== undefined) updateData.nama = nama;
    if (harga_per_kg !== undefined) updateData.harga_per_kg = harga_per_kg;
    if (is_active !== undefined) updateData.is_active = is_active;

    const data = await prisma.jenisSampah.update({
      where: { id },
      data: updateData
    });

    return apiSuccess({
      message: 'Jenis sampah berhasil diupdate',
      data: { ...data, harga_per_kg: Number(data.harga_per_kg) }
    });
  } catch (error) {
    console.error('Update jenis sampah error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = requireRole(request, ['admin']);
    if (user instanceof Response) return user;

    const { searchParams } = new URL(request.url);
    const parsedQuery = jenisSampahDeleteQuerySchema.safeParse({
      id: searchParams.get('id') ?? undefined
    });
    if (!parsedQuery.success) {
      return apiError(parsedQuery.error.issues[0]?.message || 'Query tidak valid', 400);
    }
    const { id } = parsedQuery.data;

    const jenisSampahData = await prisma.jenisSampah.findUnique({
      where: { id },
      select: { nama: true }
    });
    if (!jenisSampahData) {
      return apiError('Jenis sampah tidak ditemukan', 404);
    }

    const setoranCheck = await prisma.setoranSampah.findFirst({
      where: { jenis_sampah: jenisSampahData.nama },
      select: { id: true }
    });
    if (setoranCheck) {
      return apiError('Tidak dapat menghapus jenis sampah yang sudah digunakan dalam transaksi. Nonaktifkan saja.', 400);
    }

    await prisma.jenisSampah.delete({ where: { id } });
    return apiSuccess({ message: 'Jenis sampah berhasil dihapus' });
  } catch (error) {
    console.error('Delete jenis sampah error:', error);
    return apiError('Internal server error', 500);
  }
}
