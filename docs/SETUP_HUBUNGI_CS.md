# Setup Fitur "Hubungi CS"

Fitur ini memungkinkan admin untuk mengatur nomor WhatsApp Customer Service yang akan ditampilkan sebagai tombol "Hubungi CS" di semua dashboard user.

## Langkah-langkah Setup

### 1. Jalankan SQL Schema

Buka Supabase Dashboard > SQL Editor, kemudian jalankan query berikut:

```sql
-- Create app_settings table for storing application settings
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default CS WhatsApp number
INSERT INTO app_settings (setting_key, setting_value, description)
VALUES
  ('cs_whatsapp_number', '6281234567890', 'Nomor WhatsApp Customer Service')
ON CONFLICT (setting_key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);
```

### 2. Cara Menggunakan

#### Untuk Admin:
1. Login sebagai admin
2. Buka menu **"Pengaturan"** di sidebar
3. Masukkan nomor WhatsApp CS dengan format: `628xxxxxxxxxx`
   - Contoh: `628123456789` untuk nomor 0812-3456-789
4. Klik **"Simpan Pengaturan"**

#### Untuk User (Member/Pengelola):
1. Login ke dashboard
2. Tombol **"Hubungi CS"** akan muncul di bagian bawah sidebar (di atas tombol Logout)
3. Klik tombol untuk langsung membuka WhatsApp CS

## Fitur

### Menu Pengaturan (Admin Only)
- Path: `/dashboard/settings`
- Hanya dapat diakses oleh role **admin**
- Fitur:
  - Input nomor WhatsApp CS
  - Auto-format nomor (menambahkan prefix 62)
  - Preview link WhatsApp
  - Validasi nomor

### Tombol Hubungi CS (Semua User)
- Muncul di sidebar dashboard untuk semua role (admin, pengelola, pengguna)
- Tombol hijau dengan icon WhatsApp
- Klik untuk langsung membuka chat WhatsApp dengan CS
- Otomatis terbuka di tab baru

## API Endpoints

### GET /api/settings
**Autentikasi:** Bearer Token (semua role)

Response:
```json
{
  "cs_whatsapp_number": {
    "value": "628123456789",
    "description": "Nomor WhatsApp Customer Service"
  }
}
```

### PUT /api/settings
**Autentikasi:** Bearer Token (admin only)

Request Body:
```json
{
  "setting_key": "cs_whatsapp_number",
  "setting_value": "628123456789"
}
```

Response:
```json
{
  "message": "Setting berhasil diupdate",
  "data": {
    "id": "uuid",
    "setting_key": "cs_whatsapp_number",
    "setting_value": "628123456789",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

## Catatan

- Nomor WhatsApp harus dalam format internasional dengan kode negara (62 untuk Indonesia)
- Jika nomor belum diatur, tombol "Hubungi CS" tidak akan muncul
- Setting disimpan di tabel `app_settings` di database
- Admin dapat mengubah nomor kapan saja melalui menu Pengaturan
