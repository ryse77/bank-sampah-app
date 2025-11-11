# Troubleshooting Jenis Sampah

## Masalah: Data muncul di dashboard tapi tidak di database

### Penyebab
Data tersimpan di **state browser** (React state) tapi gagal tersimpan ke database karena:
1. Error saat POST/PUT ke API
2. Masalah koneksi ke Supabase
3. Permission error di database
4. Validation error

### Solusi

#### 1. Cek Browser Console
Buka browser console (F12) dan lihat error logs:
- Cari log yang dimulai dengan "Submitting jenis sampah:"
- Cek status response (200 = success, 400/500 = error)
- Lihat error message jika ada

#### 2. Verifikasi Data di Database
Jalankan query ini di Supabase SQL Editor:
```sql
SELECT * FROM jenis_sampah ORDER BY nama;
```

Jika data tidak ada di database tapi muncul di dashboard:
- **Refresh halaman** (F5 atau Ctrl+R)
- Data akan hilang karena hanya ada di memory browser

#### 3. Cek Permission Database
Pastikan admin memiliki permission untuk INSERT/UPDATE/DELETE:
```sql
-- Cek RLS policies
SELECT * FROM pg_policies WHERE tablename = 'jenis_sampah';
```

#### 4. Hard Refresh Browser
Jika data lama masih muncul setelah dihapus/edit:
- Windows: **Ctrl + Shift + R**
- Mac: **Cmd + Shift + R**
- Atau clear browser cache

## Masalah: Edit nama tidak bekerja

### Penyebab
- Cache browser
- Error saat update database
- Cascade update ke tabel setoran_sampah gagal

### Solusi

#### 1. Cek Console Logs
Buka browser console dan cari:
```
Submitting jenis sampah: PUT {id: "...", nama: "...", is_active: true}
Response: 200 {message: "...", data: {...}}
```

Jika status bukan 200, ada error di API.

#### 2. Verifikasi Update di Database
```sql
-- Cek nama terbaru
SELECT id, nama, is_active FROM jenis_sampah WHERE nama LIKE '%nama_lama%';

-- Cek apakah nama sudah berubah
SELECT id, nama, is_active FROM jenis_sampah WHERE nama LIKE '%nama_baru%';
```

#### 3. Cek Update di Setoran
Jika nama berubah di jenis_sampah tapi tidak di setoran_sampah:
```sql
-- Cek setoran dengan nama lama
SELECT id, jenis_sampah FROM setoran_sampah WHERE jenis_sampah = 'nama_lama';

-- Seharusnya sudah berubah otomatis ke nama baru
```

## Masalah: Delete tidak berhasil

### Penyebab
- Jenis sampah sudah digunakan dalam transaksi
- Error permission database
- Cache browser

### Solusi

#### 1. Cek Apakah Digunakan di Setoran
```sql
-- Cek penggunaan jenis sampah
SELECT
  js.nama,
  COUNT(ss.id) as jumlah_transaksi
FROM jenis_sampah js
LEFT JOIN setoran_sampah ss ON ss.jenis_sampah = js.nama
WHERE js.nama = 'Besi' -- ganti dengan nama yang ingin dihapus
GROUP BY js.nama;
```

Jika `jumlah_transaksi > 0`, tidak bisa dihapus. Solusinya:
- **Nonaktifkan** jenis sampah (toggle status)
- Jenis sampah nonaktif tidak muncul di form setor sampah

#### 2. Force Delete (Jika yakin tidak digunakan)
```sql
-- HATI-HATI: Hanya jalankan jika yakin data tidak digunakan
DELETE FROM jenis_sampah WHERE nama = 'Besi';
```

#### 3. Hard Refresh Browser
Setelah delete dari database, refresh browser:
- **Ctrl + Shift + R** (Windows)
- **Cmd + Shift + R** (Mac)

## Masalah: Perubahan tidak terlihat di sisi member

### Penyebab
Member masih menggunakan list lama karena cache browser.

### Solusi

#### 1. Member Hard Refresh
Instruksikan member untuk hard refresh:
- **Ctrl + Shift + R** (Windows)
- **Cmd + Shift + R** (Mac)

#### 2. Verifikasi API
Test endpoint di browser:
```
https://your-domain.com/api/jenis-sampah?active=true
```

Seharusnya return JSON dengan data terbaru.

#### 3. Logout & Login Ulang
Minta member logout dan login kembali.

## Debug Checklist

Saat ada masalah, ikuti checklist ini:

- [ ] Buka browser console (F12)
- [ ] Refresh halaman (F5)
- [ ] Cek error di console
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Cek data di database (Supabase SQL Editor)
- [ ] Verify API response di Network tab
- [ ] Clear browser cache
- [ ] Logout & login ulang

## SQL Queries Berguna

### Lihat semua jenis sampah
```sql
SELECT * FROM jenis_sampah ORDER BY nama;
```

### Lihat jenis sampah yang aktif
```sql
SELECT * FROM jenis_sampah WHERE is_active = true ORDER BY nama;
```

### Lihat penggunaan jenis sampah
```sql
SELECT
  js.nama,
  js.is_active,
  COUNT(ss.id) as jumlah_transaksi
FROM jenis_sampah js
LEFT JOIN setoran_sampah ss ON ss.jenis_sampah = js.nama
GROUP BY js.id, js.nama, js.is_active
ORDER BY js.nama;
```

### Hapus jenis sampah yang tidak digunakan
```sql
-- Hapus jenis sampah yang belum pernah digunakan
DELETE FROM jenis_sampah
WHERE nama NOT IN (
  SELECT DISTINCT jenis_sampah FROM setoran_sampah
);
```

### Update manual nama jenis sampah di setoran
```sql
-- Jika cascade update gagal, bisa update manual
UPDATE setoran_sampah
SET jenis_sampah = 'Nama Baru'
WHERE jenis_sampah = 'Nama Lama';
```

## Prevention Tips

1. **Selalu cek console** setelah operasi CRUD
2. **Hard refresh** setelah perubahan besar
3. **Test di database** jika ragu data tersimpan
4. **Backup data** sebelum operasi delete massal
5. **Gunakan toggle active** daripada delete untuk data yang sudah digunakan
