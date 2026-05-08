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
import { POST } from '@/app/api/backup/import/route';

const requireRoleMock = vi.mocked(requireRole);
const transactionMock = vi.mocked(prisma.$transaction);

describe('POST /api/backup/import', () => {
  it('returns 400 when file is missing', async () => {
    requireRoleMock.mockReturnValue({ id: 'admin-1', role: 'admin' } as unknown);

    const formData = new FormData();
    const req = new Request('http://localhost/api/backup/import', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req as unknown);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('File backup tidak ditemukan');
  });

  it('returns 413 when file exceeds limit', async () => {
    requireRoleMock.mockReturnValue({ id: 'admin-1', role: 'admin' } as unknown);

    const largeContent = 'a'.repeat(10 * 1024 * 1024 + 1);
    const file = new File([largeContent], 'backup.json', { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', file);

    const req = new Request('http://localhost/api/backup/import', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req as unknown);
    const body = await res.json();

    expect(res.status).toBe(413);
    expect(body.error).toContain('10 MB');
  });

  it('returns 200 and inserted counts on success', async () => {
    requireRoleMock.mockReturnValue({ id: 'admin-1', role: 'admin' } as unknown);
    transactionMock.mockResolvedValue({
      users: 1,
      jenis_sampah: 1,
      settings: 1,
      artikel: 0,
      setoran: 0,
      pencairan: 0
    } as unknown);

    const payload = {
      metadata: { version: '1.0' },
      data: {
        users: [{ id: 'u1', nama_lengkap: 'A', email: 'a@example.com', password: 'hashed' }],
        jenis_sampah: [{ id: 'j1', nama: 'Plastik' }],
        settings: [{ id: 's1', setting_key: 'k', setting_value: 'v' }],
        artikel: [],
        setoran: [],
        pencairan: []
      }
    };

    const file = new File([JSON.stringify(payload)], 'backup.json', { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', file);

    const req = new Request('http://localhost/api/backup/import', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req as unknown);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe('Import data berhasil');
    expect(body.inserted.users).toBe(1);
  });
});
