import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ── Types ─────────────────────────────────────────────────────────
type NotifyType = 'listing_live' | 'listing_nudge' | 'buyer_inquiry';

interface ListingLiveData {
  title: string;
  url: string;
}

interface ListingNudgeData {
  title: string;
  views: number;
  tip: string;
}

interface BuyerInquiryData {
  title: string;
  message: string;
  buyer_phone: string;
  buyer_name?: string;
}

interface NotifyBody {
  type: NotifyType;
  phone: string; // Kenya format: 254XXXXXXXXX
  data: ListingLiveData | ListingNudgeData | BuyerInquiryData;
}

// ── Helpers ───────────────────────────────────────────────────────
function validateKenyaPhone(phone: string): boolean {
  // Accept 254XXXXXXXXX (12 digits) or 07XXXXXXXX (10 digits)
  const cleaned = phone.replace(/\s+/g, '');
  return /^254[17]\d{8}$/.test(cleaned) || /^0[17]\d{8}$/.test(cleaned);
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.startsWith('0')) return '254' + cleaned.slice(1);
  return cleaned;
}

function buildMessage(type: NotifyType, data: NotifyBody['data']): string {
  switch (type) {
    case 'listing_live': {
      const d = data as ListingLiveData;
      return (
        `Your listing "${d.title}" is now live on MyTinyverse!\n\n` +
        `Share it with potential buyers: ${d.url}\n\n` +
        `Buyers will contact you directly on WhatsApp. Keep your phone nearby.`
      );
    }
    case 'listing_nudge': {
      const d = data as ListingNudgeData;
      return (
        `Update on your listing "${d.title}"\n\n` +
        `Your item has had ${d.views} view${d.views !== 1 ? 's' : ''} but no inquiries yet.\n\n` +
        `Tip: ${d.tip}`
      );
    }
    case 'buyer_inquiry': {
      const d = data as BuyerInquiryData;
      const name = d.buyer_name ? d.buyer_name : 'A buyer';
      return (
        `${name} is interested in your item: "${d.title}"\n\n` +
        `Message: ${d.message}\n\n` +
        `Reply to them on WhatsApp: ${d.buyer_phone}`
      );
    }
    default:
      return '';
  }
}

// ── Nudge tips by category ─────────────────────────────────────────
const NUDGE_TIPS: Record<string, string> = {
  bikes:     'Try lowering the price by 10-15% or adding a photo of the bike in action.',
  strollers: 'Add close-up photos of the harness and fold mechanism - buyers want to see those details.',
  'car-seats': 'Include the manufacture date in your description. Buyers always ask.',
  toys:      'Bundle with similar items to increase perceived value.',
  books:     'List the specific titles - buyers search by book name.',
  clothes:   'Add the brand name and exact measurements to reach more searches.',
  shoes:     'Show a photo of the sole - buyers check for wear.',
  default:   'Adding more photos (especially condition close-ups) typically doubles inquiry rates.',
};

const ADMIN_PIN = process.env.ADMIN_PIN || '0784';

// ── POST /api/notify/whatsapp ──────────────────────────────────────
export async function POST(req: NextRequest) {
  // Auth: only the admin panel may trigger outbound WhatsApp messages.
  // Without this check anyone on the internet can send messages at platform cost.
  const pin = req.headers.get('x-admin-pin');
  if (pin !== ADMIN_PIN) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: NotifyBody = await req.json();
    const { type, phone, data } = body;

    // Validate inputs
    if (!type || !phone || !data) {
      return NextResponse.json(
        { success: false, error: 'type, phone, and data are required' },
        { status: 400 }
      );
    }

    if (!['listing_live', 'listing_nudge', 'buyer_inquiry'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    if (!validateKenyaPhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Phone must be a valid Kenya number (254XXXXXXXXX or 07XXXXXXXX)' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);
    const message = buildMessage(type, data);

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Could not build message for this notification type' },
        { status: 400 }
      );
    }

    // Check Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886

    if (!accountSid || !authToken || !fromNumber) {
      // Graceful degradation: log the message, return success so the app flow continues
      console.warn('[notify/whatsapp] Twilio not configured. Would have sent:', {
        to:   `whatsapp:+${normalizedPhone}`,
        from: fromNumber,
        body: message.slice(0, 100),
      });
      return NextResponse.json({
        success: true,
        sid: 'mock-not-sent',
        note: 'Twilio not configured - message logged only',
      });
    }

    // Send via Twilio WhatsApp
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const params = new URLSearchParams({
      To:   `whatsapp:+${normalizedPhone}`,
      From: fromNumber,
      Body: message,
    });

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      },
      body: params.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[notify/whatsapp] Twilio error:', result);
      return NextResponse.json(
        { success: false, error: result.message || 'Twilio API error' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, sid: result.sid });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Notification service error';
    console.error('[notify/whatsapp] Unexpected error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
