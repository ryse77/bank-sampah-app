# Lint Unignore Plan

## Tujuan
Mencabut ignore ESLint sementara secara bertahap tanpa mematahkan CI.

## Status Saat Ini
- Sudah aktif lint (tidak di-ignore):
  - `app/(auth)/**`
  - `tests/**`
  - `lib/api.ts`
  - `lib/store/authStore.ts`
  - `app/dashboard/scan/**`
  - `app/dashboard/member/**`
  - `app/dashboard/pencairan/**`
  - `app/dashboard/saldo/**`
  - `app/dashboard/profile/**`
  - `app/dashboard/setor-sampah/**`
  - `app/dashboard/riwayat-sampah/**`
  - `app/dashboard/antrian-sampah/**`
  - `app/dashboard/complete-profile/**`
  - `app/dashboard/edukasi/**`
  - `app/dashboard/artikel/**`
  - `app/dashboard/laporan/**`
  - `app/dashboard/settings/**`
  - `app/dashboard/page.tsx`
- Masih di-ignore (dashboard bertahap):
  - `app/dashboard/antrian-sampah/**`
  - `app/dashboard/artikel/**`
  - `app/dashboard/complete-profile/**`
  - `app/dashboard/edukasi/**`
  - `app/dashboard/laporan/**`
  - `app/dashboard/pencairan/**`
  - `app/dashboard/profile/**`
  - `app/dashboard/riwayat-sampah/**`
  - `app/dashboard/saldo/**`
  - `app/dashboard/setor-sampah/**`
  - `app/dashboard/page.tsx`
  - `app/dashboard/settings/**`
  - `scripts/**/*.js`

## Tahapan
1. Fase 1 - `app/(auth)`
- Target: hapus `any` dan pastikan lint hijau.
- Status: completed.

2. Fase 2 - `tests/**`
- Target: hilangkan cast `as any` dan tipe mock.
- Status: completed.

3. Fase 3 - `lib/api.ts` dan `lib/store/authStore.ts`
- Target: ketatkan tipe API client/store.
- Status: completed.

4. Fase 4 - `app/dashboard/**`
- Target: refactor bertahap per halaman (member, laporan, settings, scan, page).
- Status: completed (`scan`, `member`, `pencairan`, `saldo`, `profile`, `setor-sampah`, `riwayat-sampah`, `antrian-sampah`, `complete-profile`, `edukasi`, `artikel`, `laporan`, `settings`, `dashboard/page.tsx` selesai).

5. Fase 5 - `scripts/**/*.js`
- Target: konversi ke `.mjs`/TS atau sesuaikan lint override script.
- Status: completed (lint override untuk CommonJS + script aktif di lint).
