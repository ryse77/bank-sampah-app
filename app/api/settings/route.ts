import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseRequestBody } from '@/lib/validators/parse';
import { settingsUpdateSchema } from '@/lib/validators/api';
import { apiError, apiSuccess } from '@/lib/http/response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Get all settings (accessible by all authenticated users)
export async function GET(request: NextRequest) {
  try {
    // Just verify user is authenticated (any role can access)
    const user = requireRole(request, ['admin', 'pengelola', 'pengguna']);
    if (user instanceof Response) return user;

    const data = await prisma.appSetting.findMany({
      orderBy: { setting_key: 'asc' }
    });

    // Convert array to object for easier access
    const settings: Record<string, { value: string; description: string | null }> = {};
    data?.forEach((setting) => {
      settings[setting.setting_key] = {
        value: setting.setting_value,
        description: setting.description
      };
    });

    return apiSuccess(settings);

  } catch (error) {
    console.error('Settings API error:', error);
    return apiError('Internal server error', 500);
  }
}

// PUT - Update settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = requireRole(request, ['admin']);
    if (user instanceof Response) return user;

    const parsed = await parseRequestBody(request, settingsUpdateSchema, 'setting_key dan setting_value diperlukan');
    if (!parsed.success) {
      return apiError(parsed.error, 400);
    }
    const { setting_key, setting_value } = parsed.data;

    const data = await prisma.appSetting.upsert({
      where: { setting_key },
      update: {
        setting_value
      },
      create: {
        setting_key,
        setting_value,
        description: setting_key === 'cs_whatsapp_number' ? 'Nomor WhatsApp Customer Service' : null,
      }
    });

    return apiSuccess({
      message: 'Setting berhasil diupdate',
      data
    });

  } catch (error: unknown) {
    console.error('Update settings error:', error);
    return apiError('Internal server error', 500);
  }
}
