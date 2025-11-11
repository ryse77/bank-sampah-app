import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireRole } from '@/lib/auth';

// GET - Get all jenis sampah
export async function GET(request: NextRequest) {
  try {
    // Allow all authenticated users to view
    const user = requireRole(request, ['admin', 'pengelola', 'pengguna']);
    if (user instanceof Response) return user;

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let query = supabaseAdmin
      .from('jenis_sampah')
      .select('*')
      .order('nama', { ascending: true });

    // Filter only active items if requested
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get jenis sampah error:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data jenis sampah' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Jenis sampah API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new jenis sampah (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, ['admin']);
    if (user instanceof Response) return user;

    const body = await request.json();
    const { nama, is_active } = body;

    if (!nama) {
      return NextResponse.json(
        { error: 'Nama jenis sampah diperlukan' },
        { status: 400 }
      );
    }

    // Check if jenis sampah with same name already exists
    const { data: existing } = await supabaseAdmin
      .from('jenis_sampah')
      .select('id')
      .eq('nama', nama)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Jenis sampah dengan nama ini sudah ada' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('jenis_sampah')
      .insert({
        nama,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error('Create jenis sampah error:', error);
      return NextResponse.json(
        { error: `Gagal menambah jenis sampah: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Jenis sampah berhasil ditambahkan',
      data
    });

  } catch (error: any) {
    console.error('Create jenis sampah error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

// PUT - Update jenis sampah (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = requireRole(request, ['admin']);
    if (user instanceof Response) return user;

    const body = await request.json();
    const { id, nama, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID diperlukan untuk update' },
        { status: 400 }
      );
    }

    // Get current data first
    const { data: currentData } = await supabaseAdmin
      .from('jenis_sampah')
      .select('nama')
      .eq('id', id)
      .single();

    if (!currentData) {
      return NextResponse.json(
        { error: 'Jenis sampah tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if updating to a name that already exists (excluding current item)
    if (nama && nama !== currentData.nama) {
      const { data: existing } = await supabaseAdmin
        .from('jenis_sampah')
        .select('id')
        .eq('nama', nama)
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: 'Jenis sampah dengan nama ini sudah ada' },
          { status: 400 }
        );
      }

      // Update all setoran_sampah records that use the old name
      const { error: updateSetoranError } = await supabaseAdmin
        .from('setoran_sampah')
        .update({ jenis_sampah: nama })
        .eq('jenis_sampah', currentData.nama);

      if (updateSetoranError) {
        console.error('Update setoran jenis_sampah error:', updateSetoranError);
        // Continue anyway, this is not critical
      }
    }

    const updateData: any = {};
    if (nama !== undefined) updateData.nama = nama;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabaseAdmin
      .from('jenis_sampah')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update jenis sampah error:', error);
      return NextResponse.json(
        { error: `Gagal update jenis sampah: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Jenis sampah berhasil diupdate',
      data
    });

  } catch (error: any) {
    console.error('Update jenis sampah error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE - Delete jenis sampah (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const user = requireRole(request, ['admin']);
    if (user instanceof Response) return user;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID diperlukan untuk delete' },
        { status: 400 }
      );
    }

    // Get jenis sampah name first
    const { data: jenisSampahData } = await supabaseAdmin
      .from('jenis_sampah')
      .select('nama')
      .eq('id', id)
      .single();

    if (!jenisSampahData) {
      return NextResponse.json(
        { error: 'Jenis sampah tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if this jenis_sampah is used in any setoran_sampah
    // The jenis_sampah column in setoran_sampah stores the name, not the ID
    const { data: setoranCheck } = await supabaseAdmin
      .from('setoran_sampah')
      .select('id')
      .eq('jenis_sampah', jenisSampahData.nama)
      .limit(1);

    if (setoranCheck && setoranCheck.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus jenis sampah yang sudah digunakan dalam transaksi. Nonaktifkan saja.' },
        { status: 400 }
      );
    }

    // Delete the jenis_sampah
    const { error } = await supabaseAdmin
      .from('jenis_sampah')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete jenis sampah error:', error);
      return NextResponse.json(
        { error: `Gagal menghapus jenis sampah: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Jenis sampah berhasil dihapus'
    });

  } catch (error: any) {
    console.error('Delete jenis sampah error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
