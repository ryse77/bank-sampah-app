/**
 * Script untuk membuat user admin menggunakan Prisma.
 * Jalankan dengan: node scripts/create-admin.js
 * Pastikan DATABASE_URL sudah diisi (lihat .env.example).
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const adminData = {
  nama_lengkap: 'Super Admin',
  email: 'admin@banksampah.com', // GANTI dengan email yang Anda inginkan
  password: 'admin123', // GANTI dengan password yang Anda inginkan
  role: 'admin',
  no_hp: '081234567890',
  kelurahan: 'Gondangan',
  kecamatan: 'Gondang',
  kabupaten: 'Sragen',
  detail_alamat: 'Kantor Bank Sampah Gondangan Sejahtera',
};

async function createAdmin() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('Error: DATABASE_URL belum diset. Isi terlebih dahulu di .env');
      process.exit(1);
    }

    console.log('\nMembuat akun admin...');
    console.log('Email:', adminData.email);
    console.log('Password (plaintext):', adminData.password);

    const existing = await prisma.user.findUnique({
      where: { email: adminData.email },
      select: { id: true },
    });

    if (existing) {
      console.error('Error: Email sudah terdaftar!');
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const qrData = `BANKSAMPAH-${adminData.email}-${Date.now()}`;
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    const user = await prisma.user.create({
      data: {
        ...adminData,
        password: hashedPassword,
        qr_code: qrCodeImage,
        qr_data: qrData,
        saldo: 0,
      },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        role: true,
      },
    });

    console.log('\nADMIN BERHASIL DIBUAT!\n');
    console.log('Nama     :', user.nama_lengkap);
    console.log('Email    :', user.email);
    console.log('Password :', adminData.password);
    console.log('Role     :', user.role);
    console.log('User ID  :', user.id);
    console.log('\nSilakan login dengan credentials di atas!\n');
    process.exit(0);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
