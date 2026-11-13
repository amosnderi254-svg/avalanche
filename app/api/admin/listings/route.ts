export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

const ADMIN_PIN = process.env.ADMIN_PIN || '0784';

function checkAuth(req: NextRequest) {
  const pin = req.headers.get('x-admin-pin');
  return pin === ADMIN_PIN;
}

// GET /api/admin/listings?status=pending
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'pending';

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listings: data });
}

// PATCH /api/admin/listings -- approve or reject
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status } = await req.json();
  if (!id || !['live', 'rejected', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Feature 3: Set expires_at 60 days from now when approving
  const updates: Record<string, unknown> = { status };
  if (status === 'live') {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);
    updates.expires_at = expiresAt.toISOString();
  }

  const { data, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Feature 2: Notify seller via ntfy.sh (fire-and-forget)
  if (data && (status === 'live' || status === 'rejected')) {
    const ntfyTopic = `mytinyverse-${id}`;
    const isApproved = status === 'live';
    const ntfyMsg = isApproved
      ? `Your listing "${data.title}" has been approved and is now live on MyTinyverse!\n${process.env.NEXT_PUBLIC_APP_URL}/listing/${id}`
      : `Your listing "${data.title}" was not approved. Please contact us on WhatsApp for details.\nhttps://wa.me/254790784084`;

    fetch(`https://ntfy.sh/${ntfyTopic}`, {
      method: 'POST',
      headers: {
        'Title': isApproved ? 'Listing approved!' : 'Listing not approved',
        'Priority': 'high',
        'Tags': isApproved ? 'white_check_mark' : 'x',
        'Content-Type': 'text/plain',
      },
      body: ntfyMsg,
    }).catch(() => { /* silent fail */ });
  }

  // Feature 4: WhatsApp notification to seller when listing goes live
  if (data && status === 'live') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886

    if (accountSid && authToken && fromNumber) {
      // Normalize seller phone to 254XXXXXXXXX
      const rawPhone  = (data.seller_whatsapp || data.seller_phone || '').replace(/\s+/g, '');
      const sellerPhone = rawPhone.startsWith('0') ? '254' + rawPhone.slice(1) : rawPhone;
      const appUrl    = process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.co.ke';

      const waBody =
        `Hi ${data.seller_name}, your listing "${data.title}" is now LIVE on MyTinyverse!\n\n` +
        `Share it with potential buyers: ${appUrl}/listing/${id}\n\n` +
        `Buyers will contact you directly on WhatsApp. Keep your phone nearby.`;

      const params = new URLSearchParams({
        To:   `whatsapp:+${sellerPhone}`,
        From: fromNumber,
        Body: waBody,
      });

      fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/x-www-form-urlencoded',
          Authorization:   'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: params.toString(),
      }).catch(() => { /* silent fail - WA notification is best-effort */ });
    }
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/listings
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = createServerClient();
  const { error } = await supabase.from('listings').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
