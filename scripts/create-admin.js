/**
 * Script untuk membuat user admin dengan password ter-encrypt
 * Jalankan dengan: node scripts/create-admin.js
 */

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const QRCode = require('qrcode');

// Konfigurasi (ganti dengan credentials Anda)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_URL dan SUPABASE_SERVICE_KEY harus ada di .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createAdmin() {
  try {
    // Data admin yang akan dibuat
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
      saldo: 0
    };

    console.log('\n🔐 Membuat akun admin...');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password (plaintext):', adminData.password);

    // 1. Hash password dengan bcrypt (sama seperti di register)
    console.log('\n⏳ Hashing password...');
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    console.log('✅ Password ter-hash:', hashedPassword.substring(0, 20) + '...');

    // 2. Generate QR Code
    console.log('\n⏳ Generating QR Code...');
    const qrData = `BANKSAMPAH-${adminData.email}-${Date.now()}`;
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    console.log('✅ QR Code generated');

    // 3. Cek apakah email sudah ada
    console.log('\n⏳ Checking existing users...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', adminData.email)
      .single();

    if (existingUser) {
      console.error('❌ Error: Email sudah terdaftar!');
      console.log('\n💡 Gunakan email lain atau hapus user yang ada terlebih dahulu.');
      process.exit(1);
    }

    // 4. Insert user ke database
    console.log('\n⏳ Creating admin user...');
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          nama_lengkap: adminData.nama_lengkap,
          email: adminData.email,
          password: hashedPassword, // Password yang sudah di-hash
          role: adminData.role,
          no_hp: adminData.no_hp,
          kelurahan: adminData.kelurahan,
          kecamatan: adminData.kecamatan,
          kabupaten: adminData.kabupaten,
          detail_alamat: adminData.detail_alamat,
          qr_code: qrCodeImage,
          qr_data: qrData,
          saldo: adminData.saldo,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('❌ Error creating admin:', error.message);
      process.exit(1);
    }

    console.log('\n✅ ✅ ✅ ADMIN BERHASIL DIBUAT! ✅ ✅ ✅\n');
    console.log('📋 DETAIL AKUN ADMIN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Nama         :', adminData.nama_lengkap);
    console.log('📧 Email        :', adminData.email);
    console.log('🔑 Password     :', adminData.password);
    console.log('👑 Role         :', adminData.role);
    console.log('📱 No HP        :', adminData.no_hp);
    console.log('🆔 User ID      :', data[0].id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 Silakan login dengan credentials di atas!\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Jalankan script
createAdmin();
