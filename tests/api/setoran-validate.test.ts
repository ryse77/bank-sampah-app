import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  requireRole: vi.fn()
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn()
  }
}));

import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { POST } from '@/app/api/setoran/validate/[id]/route';

const requireRoleMock = vi.mocked(requireRole);
const transactionMock = vi.mocked(prisma.$transaction);

describe('POST /api/setoran/validate/[id]', () => {
  it('returns 409 when setoran already processed', async () => {
    requireRoleMock.mockReturnValue({ id: 'admin-1', role: 'admin' } as any);
    transactionMock.mockImplementation(async () => {
      throw new Error('SETORAN_ALREADY_PROCESSED');
    });

    const req = new Request('http://localhost/api/setoran/validate/abc', {
      method: 'POST',
      body: JSON.stringify({ berat_sampah: 2, harga_per_kg: 1000 }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await POST(req as any, { params: Promise.resolve({ id: 'abc' }) });
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toContain('Setoran sudah diproses');
  });

  it('returns 200 and payload when validated successfully', async () => {
    requireRoleMock.mockReturnValue({ id: 'pengelola-1', role: 'pengelola' } as any);
    transactionMock.mockResolvedValue({ id: 'setoran-1', user_id: 'user-1', status: 'pending' } as any);

    const req = new Request('http://localhost/api/setoran/validate/setoran-1', {
      method: 'POST',
      body: JSON.stringify({ berat_sampah: 3, harga_per_kg: 2000 }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await POST(req as any, { params: Promise.resolve({ id: 'setoran-1' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe('Setoran berhasil divalidasi');
    expect(body.total_harga).toBe(6000);
    expect(body.user_id).toBe('user-1');
  });
});
