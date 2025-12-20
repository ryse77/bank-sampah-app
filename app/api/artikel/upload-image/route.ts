import { NextRequest, NextResponse } from 'next/server';
import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { requireRole } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * API untuk upload gambar artikel ke storage lokal (public/)
 * Menerima 3 file: desktop, tablet, mobile
 * Return URLs untuk setiap ukuran
 */
export async function POST(request: NextRequest) {
  const user = requireRole(request, ['admin']);
  if (user instanceof Response) return user;

  const writtenPaths: string[] = [];

  try {
    const formData = await request.formData();
    const desktopFile = formData.get('desktop') as File;
    const tabletFile = formData.get('tablet') as File;
    const mobileFile = formData.get('mobile') as File;

    if (!desktopFile || !tabletFile || !mobileFile) {
      return NextResponse.json(
        { error: 'Semua ukuran gambar harus disediakan' },
        { status: 400 }
      );
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (
      !validTypes.includes(desktopFile.type) ||
      !validTypes.includes(tabletFile.type) ||
      !validTypes.includes(mobileFile.type)
    ) {
      return NextResponse.json(
        { error: 'Format gambar harus JPEG, PNG, atau WebP' },
        { status: 400 }
      );
    }

    // Generate unique filename dengan timestamp
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const baseFilename = `artikel-${timestamp}-${randomString}`;

    const uploadRoot = path.join(process.cwd(), 'public', 'uploads', 'artikel');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');

    const extensionByType: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };

    const saveFile = async (file: File, sizeFolder: string) => {
      const extension = extensionByType[file.type] || 'jpg';
      const filename = `${baseFilename}.${extension}`;
      const targetDir = path.join(uploadRoot, sizeFolder);
      await mkdir(targetDir, { recursive: true });

      const filePath = path.join(targetDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      writtenPaths.push(filePath);

      const publicPath = `/uploads/artikel/${sizeFolder}/${filename}`;
      return appUrl ? `${appUrl}${publicPath}` : publicPath;
    };

    const desktopUrl = await saveFile(desktopFile, 'desktop');
    const tabletUrl = await saveFile(tabletFile, 'tablet');
    const mobileUrl = await saveFile(mobileFile, 'mobile');

    return NextResponse.json({
      message: 'Gambar berhasil diupload',
      urls: {
        desktop: desktopUrl,
        tablet: tabletUrl,
        mobile: mobileUrl,
      },
    });
  } catch (error) {
    // Best-effort cleanup if write failed mid-way
    if (error instanceof Error) {
      console.error('Upload image error:', error);
    }
    for (const filePath of writtenPaths) {
      try {
        await unlink(filePath);
      } catch {
        // ignore cleanup errors
      }
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
