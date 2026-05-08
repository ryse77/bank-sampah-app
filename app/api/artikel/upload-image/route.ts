import { NextRequest } from 'next/server';
import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { requireRole } from '@/lib/auth';
import { apiError, apiSuccess } from '@/lib/http/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
      return apiError('Semua ukuran gambar harus disediakan', 400);
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (
      !validTypes.includes(desktopFile.type) ||
      !validTypes.includes(tabletFile.type) ||
      !validTypes.includes(mobileFile.type)
    ) {
      return apiError('Format gambar harus JPEG, PNG, atau WebP', 400);
    }

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

    return apiSuccess({
      message: 'Gambar berhasil diupload',
      urls: {
        desktop: desktopUrl,
        tablet: tabletUrl,
        mobile: mobileUrl,
      },
    });
  } catch (error) {
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
    return apiError('Internal server error', 500);
  }
}
