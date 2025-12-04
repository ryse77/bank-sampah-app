import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    const take = parseInt(limit);
    const skip = parseInt(offset);

    const [data, count] = await Promise.all([
      prisma.artikel.findMany({
        include: {
          admin: { select: { nama_lengkap: true } }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take
      }),
      prisma.artikel.count()
    ]);

    return NextResponse.json({
      data,
      pagination: {
        total: count,
        limit: take,
        offset: skip
      }
    });

  } catch (error) {
    console.error('List artikel error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
