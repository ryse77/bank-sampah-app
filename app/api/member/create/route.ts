import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { requireRole } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and check if user is admin
    const user = requireRole(request, ['admin']);
    if (user instanceof Response) {
      return user;
    }

    const body = await request.json();
    const {
      nama_lengkap,
      email,
      password,
      no_hp,
      kelurahan,
      kecamatan,
      kabupaten,
      detail_alamat,
      role
    } = body;

    // Validasi input
    if (!nama_lengkap || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Nama lengkap, email, password, dan role wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi role hanya bisa pengguna atau pengelola
    if (role !== 'pengguna' && role !== 'pengelola') {
      return NextResponse.json(
        { error: 'Role hanya bisa pengguna atau pengelola' },
        { status: 400 }
      );
    }

    // Validasi panjang password
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate QR Code data (simple unique identifier)
    const qrData = `BANKSAMPAH-${email}-${Date.now()}`;
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // Buat user baru
    const newUser = await prisma.user.create({
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
        role,
        saldo: 0,
        profile_completed: false,
      },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        role: true
      }
    });

    return NextResponse.json({
      message: 'Akun berhasil dibuat',
      user: newUser,
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
