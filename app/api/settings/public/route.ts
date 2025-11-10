import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Get public settings (no authentication required)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('*')
      .in('setting_key', ['app_download_link']) // Only expose public settings
      .order('setting_key', { ascending: true });

    if (error) {
      console.error('Get public settings error:', error);
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
    console.error('Public settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
