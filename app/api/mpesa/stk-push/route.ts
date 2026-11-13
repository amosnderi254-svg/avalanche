export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { initiateStkPush } from '@/lib/mpesa';

export async function POST(req: NextRequest) {
  try {
    const { phone, amount, listing_id, account_ref } = await req.json();

    if (!phone || !amount) {
      return NextResponse.json({ success: false, error: 'Phone and amount are required' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.co.ke';
    const callbackUrl = `${appUrl}/api/mpesa/callback`;

    const result = await initiateStkPush({
      phone,
      amount: Number(amount),
      accountRef: account_ref || 'TINY',
      description: `Listing Fee`,
      callbackUrl,
    });

    // ResponseCode 0 means success
    if (result.ResponseCode === '0') {
      return NextResponse.json({
        success: true,
        checkout_request_id: result.CheckoutRequestID,
        merchant_request_id: result.MerchantRequestID,
        listing_id,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.ResponseDescription || 'STK push failed',
      }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'M-Pesa service unavailable';
    console.error('[STK Push error]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
