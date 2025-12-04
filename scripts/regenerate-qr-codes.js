/**
 * Script untuk regenerate QR codes untuk existing users dengan Prisma.
 *
 * KAPAN DIGUNAKAN:
 * - Setelah menambahkan kolom qr_data
 * - Untuk memastikan qr_code (image) dan qr_data (string) konsisten
 *
 * CARA PAKAI:
 * 1. Pastikan DATABASE_URL sudah diisi (lihat .env.example)
 * 2. Jalankan: node scripts/regenerate-qr-codes.js
 *
 * PERINGATAN:
 * - QR code lama akan diganti dengan yang baru
 * - Backup database sebelum menjalankan
 */

require('dotenv').config();
const readline = require('readline');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function regenerateQRCodes() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('Error: DATABASE_URL belum diset. Isi terlebih dahulu di .env');
      process.exit(1);
    }

    console.log('Mulai regenerate QR codes...\n');

    const users = await prisma.user.findMany({
      where: {
        role: 'pengguna',
        OR: [
          { qr_data: null },
          { qr_data: '' }
        ]
      },
      select: {
        id: true,
        email: true,
        nama_lengkap: true,
        created_at: true
      }
    });

    if (!users || users.length === 0) {
      console.log('Tidak ada user yang perlu di-regenerate QR code-nya.');
      return;
    }

    console.log(`Found ${users.length} user(s) tanpa qr_data\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`[${i + 1}/${users.length}] Processing: ${user.nama_lengkap} (${user.email})`);

      try {
        const timestamp = user.created_at ? new Date(user.created_at).getTime() : Date.now();
        const qrData = `BANKSAMPAH-${user.email}-${timestamp}`;
        const qrCodeImage = await QRCode.toDataURL(qrData);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            qr_code: qrCodeImage,
            qr_data: qrData
          }
        });

        console.log('   Success update QR data');
        successCount++;
      } catch (err) {
        console.error('   Error:', err.message);
        errorCount++;
      }
    }

    console.log('\n==============================');
    console.log('REGENERATION SUMMARY');
    console.log('==============================');
    console.log('Successful:', successCount);
    console.log('Failed    :', errorCount);
    console.log('Total     :', users.length);
    console.log('==============================\n');
  } finally {
    await prisma.$disconnect();
  }
}

console.log('========================================');
console.log('  QR CODE REGENERATION SCRIPT (Prisma)');
console.log('========================================');
console.log('PERINGATAN: Ini akan memperbarui qr_code di database!');
console.log('');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Lanjutkan? (yes/no): ', async (answer) => {
  rl.close();
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    await regenerateQRCodes()
      .then(() => {
        console.log('Selesai.');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Script gagal:', error);
        process.exit(1);
      });
  } else {
    console.log('Dibatalkan oleh user.');
    process.exit(0);
  }
});
