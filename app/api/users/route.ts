import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { mapDbUserToUser, DbUser } from '@/lib/supabase/types';

export async function GET() {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase get users error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Get wardrobe count for each user
    const { data: clothesCounts } = await supabaseAdmin
      .from('clothes')
      .select('user_id');

    const countMap: Record<string, number> = {};
    if (clothesCounts) {
      for (const item of clothesCounts) {
        countMap[item.user_id] = (countMap[item.user_id] || 0) + 1;
      }
    }

    const mappedUsers = (users as DbUser[]).map((u) => {
      const mapped = mapDbUserToUser(u);
      mapped.wardrobeCount = countMap[u.id] || 0;
      return mapped;
    });

    return NextResponse.json({ success: true, users: mappedUsers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, is_active, role } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const updates: Partial<DbUser> = {};
    if (typeof is_active === 'boolean') updates.is_active = is_active;
    if (role && (role === 'admin' || role === 'user')) updates.role = role;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: mapDbUserToUser(data as DbUser) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
