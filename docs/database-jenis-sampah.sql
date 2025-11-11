-- ========================================
-- SCRIPT UNTUK MEMBUAT TABEL JENIS SAMPAH
-- ========================================
-- Jalankan query ini di Supabase SQL Editor
-- untuk membuat tabel jenis_sampah

-- ========================================
-- STEP 1: BUAT TABEL jenis_sampah
-- ========================================
CREATE TABLE IF NOT EXISTS jenis_sampah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 2: BUAT INDEX untuk performa
-- ========================================
CREATE INDEX IF NOT EXISTS idx_jenis_sampah_nama ON jenis_sampah(nama);
CREATE INDEX IF NOT EXISTS idx_jenis_sampah_is_active ON jenis_sampah(is_active);

-- ========================================
-- STEP 3: INSERT DATA DEFAULT
-- ========================================
-- Data awal jenis sampah yang umum
INSERT INTO jenis_sampah (nama, is_active) VALUES
('Plastik', true),
('Kertas', true),
('Botol Kaca', true),
('Botol Plastik', true),
('Kardus', true),
('Kaleng', true),
('Elektronik', true)
ON CONFLICT (nama) DO NOTHING;

-- ========================================
-- STEP 4: BUAT FUNCTION untuk auto-update updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- STEP 5: BUAT TRIGGER untuk auto-update updated_at
-- ========================================
DROP TRIGGER IF EXISTS update_jenis_sampah_updated_at ON jenis_sampah;
CREATE TRIGGER update_jenis_sampah_updated_at
    BEFORE UPDATE ON jenis_sampah
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STEP 6: VERIFIKASI - Cek data jenis_sampah
-- ========================================
SELECT * FROM jenis_sampah ORDER BY nama;
