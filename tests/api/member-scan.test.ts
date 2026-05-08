import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({ requireRole: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn()
    }
  }
}));

import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { POST } from '@/app/api/member/scan/route';

const requireRoleMock = vi.mocked(requireRole);
const findFirstMock = vi.mocked(prisma.user.findFirst);
const updateMock = vi.mocked(prisma.user.update);

describe('POST /api/member/scan', () => {
  it('uses fallback email extraction and updates qr_data when matched', async () => {
    requireRoleMock.mockReturnValue({ id: 'admin-1', role: 'admin' } as unknown);

    findFirstMock
      .mockResolvedValueOnce(null as unknown)
      .mockResolvedValueOnce({
        id: 'u-1',
        nama_lengkap: 'Budi',
        email: 'budi@example.com',
        saldo: 15000,
        qr_code: null,
        qr_data: 'OLD-QR'
      } as unknown);

    updateMock.mockResolvedValue({} as unknown);

    const req = new Request('http://localhost/api/member/scan', {
      method: 'POST',
      body: JSON.stringify({ qr_data: 'BANKSAMPAH-budi@example.com-123' }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await POST(req as unknown);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.email).toBe('budi@example.com');
    expect(updateMock).toHaveBeenCalledTimes(1);
  });

  it('returns 404 when no user match found', async () => {
    requireRoleMock.mockReturnValue({ id: 'admin-1', role: 'admin' } as unknown);

    findFirstMock.mockResolvedValue(null as unknown);
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as unknown);

    const req = new Request('http://localhost/api/member/scan', {
      method: 'POST',
      body: JSON.stringify({ qr_data: 'BANKSAMPAH-none@example.com-123' }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await POST(req as unknown);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toContain('User tidak ditemukan');
  });
});
