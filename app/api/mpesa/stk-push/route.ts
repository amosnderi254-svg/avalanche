export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { initiateStkPush } from '@/lib/mpesa';
import { createServerClient } from '@/lib/supabase-server';
import { getFeeTier } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const { phone, listing_id, account_ref } = await req.json();

    if (!phone || !listing_id) {
      return NextResponse.json(
        { success: false, error: 'Phone and listing_id are required' },
        { status: 400 }
      );
    }

    // Look up the listing and recalculate the fee server-side.
    // Never trust the client-submitted amount -- a seller could pass amount: 1
    // to trigger an STK push for KES 1 instead of their actual listing fee.
    const supabase = createServerClient();
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, price, status')
      .eq('id', listing_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    const { fee: amount } = getFeeTier(listing.price);

    if (amount === 0) {
      return NextResponse.json(
        { success: false, error: 'No fee required for this listing' },
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
        listing_id,
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
