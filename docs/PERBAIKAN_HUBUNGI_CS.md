# Perbaikan Fitur Hubungi CS

Dokumen ini menjelaskan perbaikan yang telah dilakukan pada fitur "Hubungi CS".

## Masalah yang Diperbaiki

### 1. Error Saat Menyimpan Nomor WhatsApp ✅

**Masalah:**
- Saat input nomor WA di menu "Pengaturan", muncul error "Gagal menyimpan settings"

**Penyebab:**
- Tabel `app_settings` belum dibuat di database
- API menggunakan `upsert` yang tidak handle kasus insert dengan baik

**Solusi:**
- Memperbaiki API `/api/settings` (PUT method) di `app/api/settings/route.ts:46-122`
- Menambahkan logic untuk check apakah setting sudah ada
- Jika sudah ada: UPDATE
- Jika belum ada: INSERT
- Menambahkan error message yang lebih detail untuk debugging

**Cara Setup:**
```sql
-- Jalankan di Supabase SQL Editor
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);
```

### 2. Menu "Pengaturan" di Dashboard Admin ✅

**Masalah:**
- Menu "Pengaturan" tidak perlu muncul sebagai card di dashboard admin

**Analisis:**
- Setelah dicek, menu "Pengaturan" tidak ada di array `menuItems` di `app/dashboard/page.tsx:239-248`
- Menu "Pengaturan" hanya ada di **sidebar navigation** (sudah benar)
- Menu Pengaturan di sidebar: `app/dashboard/layout.tsx:114`

**Kesimpulan:**
- Menu Pengaturan sudah tepat berada di sidebar khusus untuk admin
- Tidak ada masalah yang perlu diperbaiki

### 3. Button "Hubungi CS" di Dashboard Utama ✅

**Masalah:**
- Menu "Hubungi CS" hanya tampil di sidebar, belum tampil di dashboard utama

**Solusi:**
- Menambahkan section "Hubungi CS" di halaman dashboard utama (`app/dashboard/page.tsx:452-471`)
- Button "Hubungi CS" akan muncul untuk **SEMUA USER** (admin, pengelola, pengguna)
- Tampilan: Card gradient hijau dengan button WhatsApp
- Fetch nomor WhatsApp otomatis dari settings

**Lokasi Perubahan:**
- `app/dashboard/page.tsx:37` - Tambah state `csWhatsapp`
- `app/dashboard/page.tsx:178-192` - Tambah fungsi `fetchSettings()`
- `app/dashboard/page.tsx:208` - Panggil `fetchSettings()` di useEffect
- `app/dashboard/page.tsx:452-471` - Tambah UI "Hubungi CS"

## Fitur Lengkap Sekarang

### Di Sidebar (Semua Halaman Dashboard)
- Button "Hubungi CS" muncul di bawah menu navigasi, di atas tombol Logout
- Berlaku untuk semua role: admin, pengelola, pengguna
- Lokasi: `app/dashboard/layout.tsx:207-219`

### Di Dashboard Utama (Halaman `/dashboard`)
- Card "Butuh Bantuan?" dengan button "Hubungi CS"
- Tampil di bagian bawah dashboard setelah menu cepat
- Desain: Gradient hijau, responsive, icon WhatsApp
- Lokasi: `app/dashboard/page.tsx:452-471`

### Di Menu Pengaturan (Admin Only)
- Halaman `/dashboard/settings` khusus untuk admin
- Input dan update nomor WhatsApp CS
- Auto-format nomor dengan prefix 62
- Preview link WhatsApp
- Lokasi: `app/dashboard/settings/page.tsx:1`

## Cara Penggunaan

### Untuk Admin:
1. Login sebagai admin
2. Buka menu **"Pengaturan"** di sidebar
3. Masukkan nomor WhatsApp (contoh: 628123456789)
4. Klik **"Simpan Pengaturan"**
5. Jika error, cek apakah tabel `app_settings` sudah dibuat

### Untuk Semua User:
1. Login ke dashboard
2. Tombol "Hubungi CS" akan muncul di:
   - **Sidebar** (di atas tombol Logout)
   - **Dashboard utama** (card hijau di bagian bawah)
3. Klik salah satu tombol untuk chat dengan CS via WhatsApp

## Testing

✅ Build berhasil - 36 routes
✅ API `/api/settings` sudah handle insert & update
✅ Button "Hubungi CS" di sidebar
✅ Button "Hubungi CS" di dashboard utama
✅ Menu "Pengaturan" di sidebar admin
✅ Error message lebih detail untuk debugging

## File yang Diubah

1. `app/api/settings/route.ts` - Fix PUT method untuk handle insert & update
2. `app/dashboard/page.tsx` - Tambah button "Hubungi CS" di dashboard utama
3. `docs/PERBAIKAN_HUBUNGI_CS.md` - Dokumentasi ini

## Catatan Penting

⚠️ **WAJIB**: Jalankan SQL schema untuk membuat tabel `app_settings` sebelum menggunakan fitur ini!

Lokasi SQL schema: `docs/database-settings.sql`
