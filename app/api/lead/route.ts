import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServer = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guest_name, phone, guest_count, nights, ref_code } = body;

    const fullPayload = {
      guest_name,
      phone,
      guest_count: parseInt(guest_count) || 1,
      nights: parseInt(nights) || 1,
      ref_code,
      status: 'Enquired',
      total_amount: 0,
      commission_amount: 0
    };

    let { data, error } = await supabaseServer
      .from('leads')
      .insert([fullPayload])
      .select();

    if (error) {
      const basePayload = {
        guest_name,
        phone,
        guest_count: parseInt(guest_count) || 1,
        nights: parseInt(nights) || 1,
        ref_code
      };
      
      const fallback = await supabaseServer
        .from('leads')
        .insert([basePayload])
        .select();
        
      error = fallback.error;
      data = fallback.data;
    }

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}