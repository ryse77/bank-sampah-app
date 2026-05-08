import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/http/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
const MAX_BACKUP_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

type BackupPayload = {
  metadata?: {
    version?: string;
  };
  data?: {
    users?: Record<string, unknown>[];
    setoran?: Record<string, unknown>[];
    pencairan?: Record<string, unknown>[];
    artikel?: Record<string, unknown>[];
    settings?: Record<string, unknown>[];
    jenis_sampah?: Record<string, unknown>[];
  };
};

const toDate = (value: unknown) => {
  if (value instanceof Date) return value;
  if (typeof value !== 'string' && typeof value !== 'number') {
    return new Date();
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
};

const toNumberString = (value: unknown, fallback = '0') => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return num.toString();
};

const toNullableString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  return String(value);
};

const asRecordArray = (value: unknown): Record<string, unknown>[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Record<string, unknown> =>
      typeof item === 'object' && item !== null && !Array.isArray(item)
  );
};

const validateRequiredString = (
  row: Record<string, unknown>,
  field: string,
  rowIndex: number,
  section: string
) => {
  const value = row[field];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Format backup tidak valid: ${section}[${rowIndex}].${field} wajib string non-kosong`);
  }
};

export async function POST(request: NextRequest) {
  const user = requireRole(request, ['admin']);
  if (user instanceof Response) return user;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return apiError('File backup tidak ditemukan', 400);
    }
    if (file.size > MAX_BACKUP_FILE_SIZE_BYTES) {
      return apiError('Ukuran file backup melebihi batas 10 MB', 413);
    }

    const content = await file.text();
    const parsed: BackupPayload = JSON.parse(content);

    if (!parsed.data) {
      return apiError('Format backup tidak valid (data kosong)', 400);
    }
    const users = asRecordArray(parsed.data.users);
    const setoran = asRecordArray(parsed.data.setoran);
    const pencairan = asRecordArray(parsed.data.pencairan);
    const artikel = asRecordArray(parsed.data.artikel);
    const settings = asRecordArray(parsed.data.settings);
    const jenis_sampah = asRecordArray(parsed.data.jenis_sampah);

    users.forEach((row, idx) => {
      validateRequiredString(row, 'id', idx, 'users');
      validateRequiredString(row, 'nama_lengkap', idx, 'users');
      validateRequiredString(row, 'email', idx, 'users');
      validateRequiredString(row, 'password', idx, 'users');
    });
    jenis_sampah.forEach((row, idx) => {
      validateRequiredString(row, 'id', idx, 'jenis_sampah');
      validateRequiredString(row, 'nama', idx, 'jenis_sampah');
    });
    settings.forEach((row, idx) => {
      validateRequiredString(row, 'id', idx, 'settings');
      validateRequiredString(row, 'setting_key', idx, 'settings');
      validateRequiredString(row, 'setting_value', idx, 'settings');
    });
    artikel.forEach((row, idx) => {
      validateRequiredString(row, 'id', idx, 'artikel');
      validateRequiredString(row, 'judul', idx, 'artikel');
      validateRequiredString(row, 'konten', idx, 'artikel');
      validateRequiredString(row, 'admin_id', idx, 'artikel');
    });
    setoran.forEach((row, idx) => {
      validateRequiredString(row, 'id', idx, 'setoran');
      validateRequiredString(row, 'user_id', idx, 'setoran');
      validateRequiredString(row, 'jenis_sampah', idx, 'setoran');
    });
    pencairan.forEach((row, idx) => {
      validateRequiredString(row, 'id', idx, 'pencairan');
      validateRequiredString(row, 'user_id', idx, 'pencairan');
    });

    const inserted = await prisma.$transaction(async (tx) => {
      // Seluruh proses import harus atomik: jika satu langkah gagal, data lama tetap aman.
      await tx.setoranSampah.deleteMany();
      await tx.pencairanSaldo.deleteMany();
      await tx.artikel.deleteMany();
      await tx.appSetting.deleteMany();
      await tx.jenisSampah.deleteMany();
      await tx.user.deleteMany();

      const usersCount = users.length > 0
        ? (await tx.user.createMany({
            data: users.map((u) => ({
              id: String(u.id),
              nama_lengkap: String(u.nama_lengkap),
              email: String(u.email),
              password: String(u.password),
              no_hp: toNullableString(u.no_hp),
              kelurahan: toNullableString(u.kelurahan),
              kecamatan: toNullableString(u.kecamatan),
              kabupaten: toNullableString(u.kabupaten),
              detail_alamat: toNullableString(u.detail_alamat),
              role: typeof u.role === 'string' && u.role ? u.role : 'pengguna',
              qr_code: toNullableString(u.qr_code),
              qr_data: toNullableString(u.qr_data),
              saldo: toNumberString(u.saldo, '0') ?? '0',
              profile_completed: Boolean(u.profile_completed),
              created_at: toDate(u.created_at),
              updated_at: toDate(u.updated_at),
            })),
          })).count
        : 0;

      const jenisSampahCount = jenis_sampah.length > 0
        ? (await tx.jenisSampah.createMany({
            data: jenis_sampah.map((j) => ({
              id: String(j.id),
              nama: String(j.nama),
              is_active: Boolean(j.is_active),
              created_at: toDate(j.created_at),
              updated_at: toDate(j.updated_at),
            })),
          })).count
        : 0;

      const settingsCount = settings.length > 0
        ? (await tx.appSetting.createMany({
            data: settings.map((s) => ({
              id: String(s.id),
              setting_key: String(s.setting_key),
              setting_value: String(s.setting_value),
              description: toNullableString(s.description),
              created_at: toDate(s.created_at),
              updated_at: toDate(s.updated_at),
            })),
          })).count
        : 0;

      const artikelCount = artikel.length > 0
        ? (await tx.artikel.createMany({
            data: artikel.map((a) => ({
              id: String(a.id),
              judul: String(a.judul),
              konten: String(a.konten),
              gambar: toNullableString(a.gambar),
              admin_id: String(a.admin_id),
              created_at: toDate(a.created_at),
              updated_at: toDate(a.updated_at),
            })),
          })).count
        : 0;

      const setoranCount = setoran.length > 0
        ? (await tx.setoranSampah.createMany({
            data: setoran.map((s) => ({
              id: String(s.id),
              user_id: String(s.user_id),
              jenis_sampah: String(s.jenis_sampah),
              berat_sampah: toNumberString(s.berat_sampah),
              harga_per_kg: toNumberString(s.harga_per_kg),
              total_harga: toNumberString(s.total_harga),
              metode: typeof s.metode === 'string' && s.metode ? s.metode : 'pick-up',
              status: typeof s.status === 'string' && s.status ? s.status : 'pending',
              pengelola_id: toNullableString(s.pengelola_id),
              tanggal_setor: toDate(s.tanggal_setor),
              tanggal_validasi: s.tanggal_validasi ? toDate(s.tanggal_validasi) : null,
            })),
          })).count
        : 0;

      const pencairanCount = pencairan.length > 0
        ? (await tx.pencairanSaldo.createMany({
            data: pencairan.map((p) => ({
              id: String(p.id),
              user_id: String(p.user_id),
              nominal: toNumberString(p.nominal, '0') ?? '0',
              status: typeof p.status === 'string' && p.status ? p.status : 'pending',
              pengelola_id: toNullableString(p.pengelola_id),
              tanggal_request: toDate(p.tanggal_request),
              tanggal_pencairan: p.tanggal_pencairan ? toDate(p.tanggal_pencairan) : null,
              catatan: toNullableString(p.catatan),
            })),
          })).count
        : 0;

      return {
        users: usersCount,
        jenis_sampah: jenisSampahCount,
        settings: settingsCount,
        artikel: artikelCount,
        setoran: setoranCount,
        pencairan: pencairanCount,
      };
    });

    return apiSuccess({
      message: 'Import data berhasil',
      inserted,
      metadata: parsed.metadata || {},
    });
  } catch (error: unknown) {
    console.error('Full import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Gagal melakukan import data';
    return apiError(errorMessage, 500);
  }
}
