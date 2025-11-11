# Setup Jenis Sampah

Panduan untuk setup fitur pengaturan jenis sampah di dashboard admin.

## Perubahan dari Desain Awal

Fitur jenis sampah telah disederhanakan:
- **Dihapus**: Kolom `harga_per_kg` dan `deskripsi`
- **Alasan**: Harga sampah akan diinput manual oleh pengelola saat validasi setoran sampah

## Struktur Tabel

Tabel `jenis_sampah` hanya memiliki kolom:
- `id` - UUID (Primary Key)
- `nama` - VARCHAR(100) NOT NULL UNIQUE
- `is_active` - BOOLEAN (default: true)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

## Setup Database

### Jika Tabel Belum Ada

Jalankan script: `docs/database-jenis-sampah.sql`

```sql
-- Copy semua isi file database-jenis-sampah.sql
-- Paste di Supabase SQL Editor
-- Klik Run
```

Script akan membuat:
1. Tabel `jenis_sampah` dengan struktur sederhana
2. Index untuk performa
3. Data default 7 jenis sampah
4. Trigger auto-update `updated_at`

### Jika Tabel Sudah Ada (Migrasi)

Jika Anda sudah menjalankan script lama yang memiliki kolom `harga_per_kg` dan `deskripsi`, jalankan script migrasi: `docs/database-jenis-sampah-migration.sql`

```sql
-- Copy semua isi file database-jenis-sampah-migration.sql
-- Paste di Supabase SQL Editor
-- Klik Run
```

Script migrasi akan:
1. Menghapus kolom `harga_per_kg`
2. Menghapus kolom `deskripsi`
3. Menambahkan UNIQUE constraint pada kolom `nama`
4. Menampilkan struktur tabel baru untuk verifikasi

## Fitur Admin

Admin dapat:
1. **Tambah jenis sampah baru** - Hanya input nama dan status aktif
2. **Edit jenis sampah** - Ubah nama atau status
3. **Toggle aktif/nonaktif** - Jenis sampah nonaktif tidak muncul di form setor sampah
4. **Hapus jenis sampah** - Hanya jika belum digunakan dalam transaksi

## Cara Penggunaan

1. Login sebagai admin
2. Masuk ke menu **Pengaturan**
3. Klik tab **Jenis Sampah**
4. Klik tombol **Tambah Baru**
5. Input nama jenis sampah (contoh: "Plastik PET", "Kertas HVS")
6. Centang/uncentang **Status Aktif**
7. Klik **Tambah**

## Integrasi dengan Setor Sampah

- Hanya jenis sampah yang **aktif** akan muncul di dropdown form setor sampah
- Harga sampah diinput manual oleh pengelola saat **validasi setoran**
- Pengelola dapat input harga berbeda untuk jenis sampah yang sama tergantung kualitas/kondisi

## Validasi

- Nama jenis sampah harus **unik** (tidak boleh duplikat)
- Jenis sampah yang sudah digunakan dalam transaksi **tidak bisa dihapus**
- Jenis sampah bisa **dinonaktifkan** untuk mencegah penggunaan di masa depan tanpa menghapus data historis

## Contoh Data

Setelah setup, tabel akan memiliki data default:
- Plastik
- Kertas
- Botol Kaca
- Botol Plastik
- Kardus
- Kaleng
- Elektronik

Admin bisa menambah, mengubah, atau menonaktifkan sesuai kebutuhan.
