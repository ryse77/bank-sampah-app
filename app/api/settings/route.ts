import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireRole } from '@/lib/auth';

// GET - Get all settings (accessible by all authenticated users)
export async function GET(request: NextRequest) {
  try {
    // Just verify user is authenticated (any role can access)
    const user = requireRole(request, ['admin', 'pengelola', 'pengguna']);
    if (user instanceof Response) return user;

    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('*')
      .order('setting_key', { ascending: true });

    if (error) {
      console.error('Get settings error:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil settings' },
        { status: 500 }
      );
    }

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

    // Check if setting exists
    const { data: existingSetting } = await supabaseAdmin
      .from('app_settings')
      .select('*')
      .eq('setting_key', setting_key)
      .single();

    let data, error;

    if (existingSetting) {
      // Update existing setting
      const result = await supabaseAdmin
        .from('app_settings')
        .update({
          setting_value,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', setting_key)
        .select()
        .single();

      data = result.data;
      error = result.error;
    } else {
      // Insert new setting
      const result = await supabaseAdmin
        .from('app_settings')
        .insert({
          setting_key,
          setting_value,
          description: setting_key === 'cs_whatsapp_number' ? 'Nomor WhatsApp Customer Service' : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Update settings error:', error);
      return NextResponse.json(
        { error: `Gagal update setting: ${error.message}` },
        { status: 500 }
      );
    }

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
