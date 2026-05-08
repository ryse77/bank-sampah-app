import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({ requireRole: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    jenisSampah: {
      findUnique: vi.fn(),
      delete: vi.fn(),
      create: vi.fn()
    },
    setoranSampah: {
      findFirst: vi.fn()
    }
  }
}));

import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DELETE, POST } from '@/app/api/jenis-sampah/route';

const requireRoleMock = vi.mocked(requireRole);

describe('/api/jenis-sampah guards', () => {
  it('rejects duplicate name on create', async () => {
    requireRoleMock.mockReturnValue({ id: 'admin-1', role: 'admin' } as unknown);
    vi.mocked(prisma.jenisSampah.findUnique).mockResolvedValue({ id: 'j1', nama: 'Plastik' } as unknown);

    const req = new Request('http://localhost/api/jenis-sampah', {
      method: 'POST',
      body: JSON.stringify({ nama: 'Plastik', harga_per_kg: 2000, is_active: true }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await POST(req as unknown);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('sudah ada');
  });

  it('rejects delete when jenis sampah has related transactions', async () => {
    requireRoleMock.mockReturnValue({ id: 'admin-1', role: 'admin' } as unknown);
    vi.mocked(prisma.jenisSampah.findUnique).mockResolvedValue({ nama: 'Plastik' } as unknown);
    vi.mocked(prisma.setoranSampah.findFirst).mockResolvedValue({ id: 's1' } as unknown);

    const req = new Request('http://localhost/api/jenis-sampah?id=j1', {
      method: 'DELETE'
    });

    const res = await DELETE(req as unknown);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('Nonaktifkan saja');
  });
});
