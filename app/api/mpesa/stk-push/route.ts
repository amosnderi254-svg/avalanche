export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { initiateStkPush } from '@/lib/mpesa';
import { getFeeTier } from '@/lib/constants';
import { createRateLimiter, getClientIp } from '@/lib/rate-limit';

// 5 STK push attempts per IP per 10 minutes -- prevents M-Pesa API abuse / charges
const rateLimiter = createRateLimiter({ maxRequests: 5, windowMs: 10 * 60_000, keyPrefix: 'stk' });

export async function POST(req: NextRequest) {
  // Rate limit: prevent abuse that could rack up M-Pesa API charges
  const ip = getClientIp(req);
  const rl = rateLimiter.check(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: 'Too many payment requests. Please wait 10 minutes before trying again.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  try {
    const { phone, price, account_ref } = await req.json();

    if (!phone || price === undefined || price === null) {
      return NextResponse.json(
        { success: false, error: 'Phone and price are required' },
        { status: 400 }
      );
    }

    // Recalculate the fee server-side from the listing price.
    // The client sends the item's sale price (what it entered), and the server
    // determines the correct tier fee -- a seller cannot manipulate the amount
    // by sending a different value since the fee is deterministic from the price.
    const { fee: amount } = getFeeTier(Number(price));

    if (amount === 0) {
      return NextResponse.json(
        { success: false, error: 'No listing fee required for donations' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.co.ke';
    const callbackUrl = `${appUrl}/api/mpesa/callback`;

    const result = await initiateStkPush({
      phone,
      amount,
      accountRef: account_ref || 'TINY',
      description: 'Listing Fee',
      callbackUrl,
    });

    // ResponseCode 0 means success
    if (result.ResponseCode === '0') {
      return NextResponse.json({
        success: true,
        checkout_request_id: result.CheckoutRequestID,
        merchant_request_id: result.MerchantRequestID,
        amount, // Return verified server-calculated amount so UI can confirm it
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
