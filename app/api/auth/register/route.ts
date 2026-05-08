import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validators/api';
import { parseRequestBody } from '@/lib/validators/parse';
import { apiError, apiSuccess } from '@/lib/http/response';

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseRequestBody(request, registerSchema);
    if (!parsed.success) {
      return apiError(parsed.error, 400);
    }

    const {
      nama_lengkap, 
      email, 
      password, 
      no_hp, 
      kelurahan, 
      kecamatan, 
      kabupaten, 
      detail_alamat 
    } = parsed.data;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate QR Code data (simple unique identifier)
    const qrData = `BANKSAMPAH-${email}-${Date.now()}`;
    const qrCodeImage = await QRCode.toDataURL(qrData);

    const user = await prisma.user.create({
      data: {
        nama_lengkap,
        email,
        password: hashedPassword,
        no_hp: no_hp || null,
        kelurahan: kelurahan || null,
        kecamatan: kecamatan || null,
        kabupaten: kabupaten || null,
        detail_alamat: detail_alamat || null,
        qr_code: qrCodeImage,  // QR image for display
        qr_data: qrData,        // QR data string for scanning
        role: 'pengguna',
        saldo: 0,
      },
      select: { id: true },
    });

    return apiSuccess({
      message: 'Registrasi berhasil',
      userId: user.id,
      profile_completed: false
    }, 201);

  } catch (error) {
    console.error('Register error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return apiError('Email sudah terdaftar', 400);
    }
    return apiError('Internal server error', 500);
  }
}
