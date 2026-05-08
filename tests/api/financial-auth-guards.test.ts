import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
  requireRole: vi.fn()
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    setoranSampah: { create: vi.fn() },
    user: { findUnique: vi.fn() },
    pencairanSaldo: { create: vi.fn() },
    $transaction: vi.fn()
  }
}));

import { requireAuth, requireRole } from '@/lib/auth';
import { POST as createSetoran } from '@/app/api/setoran/create/route';
import { POST as requestPencairan } from '@/app/api/pencairan/request/route';
import { POST as validateSetoran } from '@/app/api/setoran/validate/[id]/route';
import { POST as approvePencairan } from '@/app/api/pencairan/approve/[id]/route';

const requireAuthMock = vi.mocked(requireAuth);
const requireRoleMock = vi.mocked(requireRole);

describe('Financial auth guards', () => {
  it('setoran create returns 401 when unauthenticated', async () => {
    requireAuthMock.mockReturnValue(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }) as any);

    const req = new Request('http://localhost/api/setoran/create', {
      method: 'POST',
      body: JSON.stringify({ jenis_sampah: 'Plastik', metode: 'pick-up' }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await createSetoran(req as any);
    expect(res.status).toBe(401);
  });

  it('pencairan request returns 401 when unauthenticated', async () => {
    requireAuthMock.mockReturnValue(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }) as any);

    const req = new Request('http://localhost/api/pencairan/request', {
      method: 'POST',
      body: JSON.stringify({ nominal: 1000 }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await requestPencairan(req as any);
    expect(res.status).toBe(401);
  });

  it('setoran validate returns 403 when role is forbidden', async () => {
    requireRoleMock.mockReturnValue(new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }) as any);

    const req = new Request('http://localhost/api/setoran/validate/s1', {
      method: 'POST',
      body: JSON.stringify({ berat_sampah: 1, harga_per_kg: 1000 }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await validateSetoran(req as any, { params: Promise.resolve({ id: 's1' }) });
    expect(res.status).toBe(403);
  });

  it('pencairan approve returns 403 when role is forbidden', async () => {
    requireRoleMock.mockReturnValue(new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }) as any);

    const req = new Request('http://localhost/api/pencairan/approve/p1', {
      method: 'POST',
      body: JSON.stringify({ status: 'approved' }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await approvePencairan(req as any, { params: Promise.resolve({ id: 'p1' }) });
    expect(res.status).toBe(403);
  });
});
