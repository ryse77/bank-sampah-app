import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      nama_lengkap, 
      email, 
      password, 
      no_hp, 
      kelurahan, 
      kecamatan, 
      kabupaten, 
      detail_alamat 
    } = body;

    // Validasi input
    if (!nama_lengkap || !email || !password) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      message: 'Registrasi berhasil',
      userId: user.id,
      profile_completed: false
    }, { status: 201 });

  } catch (error) {
    console.error('Register error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
