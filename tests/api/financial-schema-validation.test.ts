import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  requireRole: vi.fn(),
  requireAuth: vi.fn()
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    setoranSampah: { create: vi.fn() },
    user: { findUnique: vi.fn() },
    pencairanSaldo: { create: vi.fn() }
  }
}));

import { requireAuth, requireRole } from '@/lib/auth';
import { POST as validateSetoran } from '@/app/api/setoran/validate/[id]/route';
import { POST as approvePencairan } from '@/app/api/pencairan/approve/[id]/route';
import { POST as createSetoran } from '@/app/api/setoran/create/route';
import { POST as requestPencairan } from '@/app/api/pencairan/request/route';

const requireAuthMock = vi.mocked(requireAuth);
const requireRoleMock = vi.mocked(requireRole);

describe('Financial schema validation', () => {
  it('setoran validate returns 400 for negative numbers', async () => {
    requireRoleMock.mockReturnValue({ id: 'admin-1', role: 'admin' } as any);

    const req = new Request('http://localhost/api/setoran/validate/s1', {
      method: 'POST',
      body: JSON.stringify({ berat_sampah: -1, harga_per_kg: 1000 }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await validateSetoran(req as any, { params: Promise.resolve({ id: 's1' }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('angka positif');
  });

  it('pencairan approve returns 400 for invalid status', async () => {
    requireRoleMock.mockReturnValue({ id: 'admin-1', role: 'admin' } as any);

    const req = new Request('http://localhost/api/pencairan/approve/p1', {
      method: 'POST',
      body: JSON.stringify({ status: 'done' }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await approvePencairan(req as any, { params: Promise.resolve({ id: 'p1' }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('Status tidak valid');
  });

  it('setoran create returns 400 for invalid metode', async () => {
    requireAuthMock.mockReturnValue({ id: 'u1', role: 'pengguna' } as any);

    const req = new Request('http://localhost/api/setoran/create', {
      method: 'POST',
      body: JSON.stringify({ jenis_sampah: 'Plastik', metode: 'dropbox' }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await createSetoran(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('Metode');
  });

  it('pencairan request returns 400 for non-positive nominal', async () => {
    requireAuthMock.mockReturnValue({ id: 'u1', role: 'pengguna' } as any);

    const req = new Request('http://localhost/api/pencairan/request', {
      method: 'POST',
      body: JSON.stringify({ nominal: 0 }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await requestPencairan(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('Nominal harus lebih besar dari 0');
  });
});
