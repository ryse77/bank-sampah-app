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
import { POST } from '@/app/api/pencairan/approve/[id]/route';

const requireRoleMock = vi.mocked(requireRole);
const transactionMock = vi.mocked(prisma.$transaction);

describe('POST /api/pencairan/approve/[id]', () => {
  it('returns 400 when saldo is insufficient', async () => {
    requireRoleMock.mockReturnValue({ id: 'admin-1', role: 'admin' } as unknown);
    transactionMock.mockImplementation(async () => {
      throw new Error('INSUFFICIENT_SALDO');
    });

    const req = new Request('http://localhost/api/pencairan/approve/pc-1', {
      method: 'POST',
      body: JSON.stringify({ status: 'approved', catatan: 'ok' }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await POST(req as unknown, { params: Promise.resolve({ id: 'pc-1' }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Saldo tidak mencukupi');
  });

  it('returns 200 when rejected successfully', async () => {
    requireRoleMock.mockReturnValue({ id: 'admin-1', role: 'admin' } as unknown);
    transactionMock.mockResolvedValue(undefined as unknown);

    const req = new Request('http://localhost/api/pencairan/approve/pc-2', {
      method: 'POST',
      body: JSON.stringify({ status: 'rejected', catatan: 'invalid request' }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await POST(req as unknown, { params: Promise.resolve({ id: 'pc-2' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toContain('ditolak');
  });
});
