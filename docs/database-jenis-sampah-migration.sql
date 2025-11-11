-- ========================================
-- MIGRATION SCRIPT: Hapus kolom harga_per_kg dan deskripsi
-- ========================================
-- Jalankan query ini di Supabase SQL Editor jika tabel sudah ada
-- Script ini akan menghapus kolom yang tidak diperlukan

-- ========================================
-- CEK STRUKTUR TABEL SAAT INI
-- ========================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'jenis_sampah'
ORDER BY ordinal_position;

-- ========================================
-- DROP KOLOM yang tidak diperlukan
-- ========================================
ALTER TABLE jenis_sampah
DROP COLUMN IF EXISTS harga_per_kg,
DROP COLUMN IF EXISTS deskripsi;

-- ========================================
-- TAMBAHKAN UNIQUE CONSTRAINT pada nama
-- ========================================
ALTER TABLE jenis_sampah
DROP CONSTRAINT IF EXISTS jenis_sampah_nama_key;

ALTER TABLE jenis_sampah
ADD CONSTRAINT jenis_sampah_nama_key UNIQUE (nama);

-- ========================================
-- VERIFIKASI STRUKTUR TABEL BARU
-- ========================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'jenis_sampah'
ORDER BY ordinal_position;

-- Hasil yang diharapkan:
-- id, nama, is_active, created_at, updated_at

-- ========================================
-- CEK DATA YANG ADA
-- ========================================
SELECT * FROM jenis_sampah ORDER BY nama;
