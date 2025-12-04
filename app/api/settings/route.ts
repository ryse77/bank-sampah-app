import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const settings: Record<string, any> = {};
    data?.forEach((setting) => {
      settings[setting.setting_key] = {
        value: setting.setting_value,
        description: setting.description
      };
    });

    return NextResponse.json(settings);

  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = requireRole(request, ['admin']);
    if (user instanceof Response) return user;

    const body = await request.json();
    const { setting_key, setting_value } = body;

    if (!setting_key || setting_value === undefined) {
      return NextResponse.json(
        { error: 'setting_key dan setting_value diperlukan' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      message: 'Setting berhasil diupdate',
      data
    });

  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
