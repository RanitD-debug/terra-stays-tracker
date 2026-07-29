import { NextResponse } from 'next/server';

// Central in-memory storage on Vercel server
let globalLeads: any[] = [];
let globalAffiliates: any[] = [];

export async function GET() {
  return NextResponse.json({
    leads: globalLeads,
    affiliates: globalAffiliates
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (action === 'ADD_LEAD') {
      // Prevent duplicates
      const exists = globalLeads.some(l => l.id === payload.id);
      if (!exists) {
        globalLeads.unshift(payload);
      }
      return NextResponse.json({ success: true, leads: globalLeads });
    }

    if (action === 'ADD_AFFILIATE') {
      const exists = globalAffiliates.some(a => a.ref_code === payload.ref_code);
      if (!exists) {
        globalAffiliates.unshift(payload);
      }
      return NextResponse.json({ success: true, affiliates: globalAffiliates });
    }

    if (action === 'UPDATE_LEAD_STATUS') {
      globalLeads = globalLeads.map(lead => {
        if (lead.id === payload.id || (lead.guest_name === payload.guest_name && lead.phone === payload.phone)) {
          return {
            ...lead,
            status: payload.status,
            total_amount: payload.total_amount ?? lead.total_amount,
            commission_amount: payload.commission_amount ?? lead.commission_amount
          };
        }
        return lead;
      });
      return NextResponse.json({ success: true, leads: globalLeads });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}