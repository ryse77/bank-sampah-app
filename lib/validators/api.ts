import { z } from 'zod';

export const createSetoranSchema = z.object({
  jenis_sampah: z.string().trim().min(1, 'Jenis sampah wajib diisi').max(120, 'Jenis sampah terlalu panjang'),
  metode: z.enum(['pick-up', 'antar-langsung'], {
    error: 'Metode harus "pick-up" atau "antar-langsung"'
  })
});

export const pencairanRequestSchema = z.object({
  nominal: z.number().positive('Nominal harus lebih besar dari 0')
});

export const registerSchema = z.object({
  nama_lengkap: z.string().trim().min(2, 'Nama lengkap minimal 2 karakter').max(120, 'Nama lengkap terlalu panjang'),
  email: z.email('Format email tidak valid').transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8, 'Password minimal 8 karakter').max(128, 'Password terlalu panjang'),
  no_hp: z.string().trim().max(30, 'Nomor HP terlalu panjang').optional().or(z.literal('')),
  kelurahan: z.string().trim().max(100, 'Kelurahan terlalu panjang').optional().or(z.literal('')),
  kecamatan: z.string().trim().max(100, 'Kecamatan terlalu panjang').optional().or(z.literal('')),
  kabupaten: z.string().trim().max(100, 'Kabupaten terlalu panjang').optional().or(z.literal('')),
  detail_alamat: z.string().trim().max(255, 'Detail alamat terlalu panjang').optional().or(z.literal(''))
});

export const searchByCodeSchema = z.object({
  code: z.string().trim().min(3, 'Kode harus minimal 3 karakter').max(12, 'Kode maksimal 12 karakter')
});

export const loginSchema = z.object({
  email: z.email('Format email tidak valid').transform((value) => value.toLowerCase().trim()),
  password: z.string().min(1, 'Password harus diisi').max(128, 'Password terlalu panjang')
});

export const checkEmailSchema = z.object({
  email: z.email('Format email tidak valid').transform((value) => value.toLowerCase().trim())
});

export const memberCreateSchema = registerSchema.extend({
  role: z.enum(['pengguna', 'pengelola'], {
    error: 'Role hanya bisa pengguna atau pengelola'
  })
});

export const listPencairanQuerySchema = z.object({
  status: z.enum(['all', 'pending', 'approved', 'rejected']).optional()
});

export const settingsUpdateSchema = z.object({
  setting_key: z.string().trim().min(1, 'setting_key diperlukan').max(120, 'setting_key terlalu panjang'),
  setting_value: z.string().trim().max(5000, 'setting_value terlalu panjang')
});

export const jenisSampahListQuerySchema = z.object({
  active: z.enum(['true', 'false']).optional()
});

export const jenisSampahCreateSchema = z.object({
  nama: z.string().trim().min(1, 'Nama jenis sampah diperlukan').max(120, 'Nama jenis sampah terlalu panjang'),
  is_active: z.boolean().optional()
});

export const jenisSampahUpdateSchema = z.object({
  id: z.string().trim().min(1, 'ID diperlukan untuk update'),
  nama: z.string().trim().min(1, 'Nama tidak boleh kosong').max(120, 'Nama jenis sampah terlalu panjang').optional(),
  is_active: z.boolean().optional()
});

export const jenisSampahDeleteQuerySchema = z.object({
  id: z.string().trim().min(1, 'ID diperlukan untuk delete')
});

export const laporanExportQuerySchema = z.object({
  type: z.enum(['setoran', 'pencairan']).default('setoran'),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional()
});

export const profileCompleteSchema = z.object({
  no_hp: z.string().trim().max(30, 'Nomor HP terlalu panjang').optional().or(z.literal('')),
  kelurahan: z.string().trim().max(100, 'Kelurahan terlalu panjang').optional().or(z.literal('')),
  kecamatan: z.string().trim().max(100, 'Kecamatan terlalu panjang').optional().or(z.literal('')),
  kabupaten: z.string().trim().max(100, 'Kabupaten terlalu panjang').optional().or(z.literal('')),
  detail_alamat: z.string().trim().max(255, 'Detail alamat terlalu panjang').optional().or(z.literal(''))
});

export const memberListQuerySchema = z.object({
  role: z.enum(['all', 'admin', 'pengelola', 'pengguna']).optional(),
  search: z.string().trim().max(120, 'Pencarian terlalu panjang').optional()
});

export const pencairanApproveSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    error: 'Status tidak valid'
  }),
  catatan: z.string().trim().max(500, 'Catatan terlalu panjang').optional().or(z.literal(''))
});

export const setoranValidateSchema = z.object({
  berat_sampah: z.coerce.number().positive('Berat sampah dan harga per kg harus angka positif'),
  harga_per_kg: z.coerce.number().positive('Berat sampah dan harga per kg harus angka positif')
});

export const memberPasswordUpdateSchema = z.object({
  password: z.string().min(8, 'Password minimal 8 karakter').max(128, 'Password terlalu panjang')
});

const artikelGambarSchema = z.union([
  z.string(),
  z.record(z.string(), z.string()),
  z.null()
]);

export const artikelCreateSchema = z.object({
  judul: z.string().trim().min(1, 'Judul dan konten harus diisi').max(200, 'Judul terlalu panjang'),
  konten: z.string().trim().min(1, 'Judul dan konten harus diisi'),
  gambar: artikelGambarSchema.optional()
});

export const artikelUpdateSchema = z.object({
  judul: z.string().trim().min(1, 'Judul tidak boleh kosong').max(200, 'Judul terlalu panjang').optional(),
  konten: z.string().trim().min(1, 'Konten tidak boleh kosong').optional(),
  gambar: artikelGambarSchema.optional()
});

export const artikelListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1, 'Limit minimal 1').max(100, 'Limit maksimal 100').default(10),
  offset: z.coerce.number().int().min(0, 'Offset tidak boleh negatif').default(0)
});

export const memberScanSchema = z.object({
  qr_data: z.string().trim().min(1, 'QR data diperlukan').max(500, 'QR data terlalu panjang')
});
