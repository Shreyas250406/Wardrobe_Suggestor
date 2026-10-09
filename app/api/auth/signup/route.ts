import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { mapDbUserToUser, DbUser } from '@/lib/supabase/types';

export async function POST(req: NextRequest) {
  try {
    const { name, email, role = 'user' } = await req.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Full name is required' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email address is required' }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    // Check if email already exists in Supabase
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .ilike('email', normalized)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // Insert new user into Supabase users table
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        email: normalized,
        full_name: name.trim(),
        role: role === 'admin' ? 'admin' : 'user',
        is_active: true,
        email_verified: true,
        gender_preference: 'Unisex',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        last_login_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase signup insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const newUser = mapDbUserToUser(data as DbUser);
    newUser.wardrobeCount = 0;

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
