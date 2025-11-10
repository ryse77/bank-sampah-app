# Setup Landing Page & Download Link

Dokumentasi untuk fitur Landing Page dan Link Download Aplikasi yang dapat diatur oleh Admin.

## Fitur yang Dibuat

### 1. Landing Page (`/`)
Halaman home yang menarik dengan fitur:
- ✅ Hero section dengan CTA buttons
- ✅ Section "Mengapa Memilih Bank Sampah"
- ✅ Section "Cara Kerja" (3 steps)
- ✅ Section CTA dengan 2 tombol:
  - **Masuk/Daftar** → Link ke `/login` dan `/register`
  - **Download Aplikasi** → Link dinamis dari settings (diatur admin)
- ✅ Footer dengan menu navigasi
- ✅ Fully responsive untuk mobile & desktop

### 2. Menu Pengaturan Download Link (Admin Only)
Di halaman `/dashboard/settings`, admin dapat mengatur:
- ✅ Nomor WhatsApp Customer Service
- ✅ **Link Download Aplikasi** (NEW!)

### 3. Public API untuk Settings
API endpoint `/api/settings/public` yang tidak perlu autentikasi untuk mengambil link download di landing page.

## Setup Database

### 1. Jalankan SQL di Supabase

Buka **Supabase Dashboard > SQL Editor**, kemudian jalankan:

```sql
-- Insert default settings (jika belum ada)
INSERT INTO app_settings (setting_key, setting_value, description)
VALUES
  ('cs_whatsapp_number', '6281234567890', 'Nomor WhatsApp Customer Service'),
  ('app_download_link', 'https://example.com/download', 'Link download aplikasi mobile')
ON CONFLICT (setting_key) DO NOTHING;
```

**Note:** Jika tabel `app_settings` belum dibuat, jalankan terlebih dahulu:

```sql
-- Create app_settings table
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

## Cara Menggunakan

### Untuk Admin:

1. **Login sebagai admin**
2. **Buka menu "Pengaturan"** di sidebar
3. **Atur Link Download Aplikasi:**
   - Scroll ke section "Aplikasi Mobile"
   - Masukkan link download (contoh: `https://drive.google.com/file/d/xxx/view`)
   - Klik **"Simpan Pengaturan"**

### Link Download Akan Muncul Di:

1. **Landing Page** (`/`)
   - Hero section → Tombol "Download Aplikasi"
   - CTA section → Tombol "Download Aplikasi"
   - Footer → Menu "Download Aplikasi"

2. **Dashboard User** (semua role)
   - Section "Hubungi CS" di dashboard utama

## Struktur File

### Landing Page
- **File:** `app/page.tsx`
- **Features:**
  - Modern gradient design
  - Responsive layout
  - Animated transitions
  - SEO friendly

### Settings Page (Admin)
- **File:** `app/dashboard/settings/page.tsx`
- **Features:**
  - Form untuk nomor WA CS
  - Form untuk link download aplikasi
  - Preview link real-time
  - Auto-validation

### API Routes

#### 1. GET `/api/settings/public`
**Public API** (no authentication required)

Response:
```json
{
  "app_download_link": {
    "value": "https://example.com/download",
    "description": "Link download aplikasi mobile"
  }
}
```

#### 2. GET `/api/settings`
**Private API** (authentication required)

Response: All settings including CS WhatsApp

#### 3. PUT `/api/settings`
**Admin Only**

Request Body:
```json
{
  "setting_key": "app_download_link",
  "setting_value": "https://example.com/download"
}
```

## Contoh Link Download

Anda dapat menggunakan berbagai platform:

1. **Google Drive:**
   ```
   https://drive.google.com/file/d/FILE_ID/view
   ```

2. **Google Play Store:**
   ```
   https://play.google.com/store/apps/details?id=com.yourapp
   ```

3. **Direct Download:**
   ```
   https://yourdomain.com/downloads/app-v1.0.apk
   ```

4. **GitHub Releases:**
   ```
   https://github.com/username/repo/releases/download/v1.0/app.apk
   ```

## Keamanan

- ✅ Public API hanya expose link download (tidak expose data sensitif)
- ✅ Update settings hanya bisa dilakukan oleh admin
- ✅ Input validation untuk URL format
- ✅ XSS protection dengan proper escaping

## Testing

### Test Landing Page:
1. Buka browser: `http://localhost:3000/`
2. Cek tampilan home page
3. Cek apakah tombol "Download Aplikasi" muncul
4. Klik tombol dan pastikan redirect ke link yang benar

### Test Settings Page:
1. Login sebagai admin
2. Buka `/dashboard/settings`
3. Masukkan link download
4. Klik "Simpan Pengaturan"
5. Refresh halaman home untuk cek perubahan

## Build Status

✅ Build berhasil - 37 routes
✅ No TypeScript errors
✅ Landing page responsive
✅ API endpoints working

## Troubleshooting

### Tombol "Download Aplikasi" tidak muncul:
1. Pastikan tabel `app_settings` sudah dibuat
2. Pastikan ada data `app_download_link` di database
3. Cek console browser untuk error API

### Error saat menyimpan settings:
1. Pastikan login sebagai admin
2. Cek network tab untuk error detail
3. Pastikan link dalam format URL yang valid

## Lokasi File

- Landing Page: `app/page.tsx`
- Settings Page: `app/dashboard/settings/page.tsx`
- Public API: `app/api/settings/public/route.ts`
- Settings API: `app/api/settings/route.ts`
- Database Schema: `docs/database-settings.sql`
- Documentation: `docs/LANDING_PAGE_SETUP.md`
