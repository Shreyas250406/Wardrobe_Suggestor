import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  mapDbClothToWardrobeItem,
  mapWardrobeItemToDbCloth,
  DbCloth,
} from '@/lib/supabase/types';
import { WardrobeItem } from '@/types/wardrobe';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_USER_ID = '11111111-1111-1111-1111-111111111111';

function normalizeUserId(id?: string | null): string {
  if (!id || !UUID_REGEX.test(id)) {
    return DEFAULT_USER_ID;
  }
  return id;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const all = searchParams.get('all') === 'true';

    let query = supabaseAdmin.from('clothes').select('*').order('created_at', { ascending: false });

    if (userId && !all) {
      query = query.eq('user_id', normalizeUserId(userId));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase wardrobe GET error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const items: WardrobeItem[] = (data as DbCloth[]).map(mapDbClothToWardrobeItem);

    return NextResponse.json({ success: true, items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { item, userId } = body;

    if (!item || !userId) {
      return NextResponse.json({ success: false, error: 'Item and userId are required' }, { status: 400 });
    }

    const validUserId = normalizeUserId(userId);

    // Prepare DB payload
    const dbPayload = mapWardrobeItemToDbCloth(item, validUserId);

    const { data, error } = await supabaseAdmin
      .from('clothes')
      .upsert(dbPayload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Supabase wardrobe POST error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const savedItem = mapDbClothToWardrobeItem(data as DbCloth);
    return NextResponse.json({ success: true, item: savedItem }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Clothing item ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('clothes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase wardrobe DELETE error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, usage_count, is_favorite, product_display_name } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof usage_count === 'number') updates.usage_count = usage_count;
    if (typeof is_favorite === 'boolean') updates.is_favorite = is_favorite;
    if (typeof product_display_name === 'string') updates.product_display_name = product_display_name;

    const { data, error } = await supabaseAdmin
      .from('clothes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: mapDbClothToWardrobeItem(data as DbCloth) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
