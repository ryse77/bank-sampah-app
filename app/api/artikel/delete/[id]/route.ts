import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = requireRole(request, ['admin']);
  if (user instanceof Response) return user;

  try {
    const { id } = await params;

    await prisma.artikel.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Artikel berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete artikel error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
