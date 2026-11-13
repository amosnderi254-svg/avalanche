export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

// Safaricom will POST to this URL after STK push completes
// We log it and return 200 -- the user manually enters the code in the UI
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = body?.Body?.stkCallback;

    if (!result) {
      console.log('[M-Pesa callback] Invalid payload:', JSON.stringify(body));
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = result;

    if (ResultCode === 0) {
      // Payment successful
      const items = CallbackMetadata?.Item || [];
      const get = (name: string) => items.find((i: { Name: string }) => i.Name === name)?.Value;

      const mpesaCode = get('MpesaReceiptNumber');
      const amount = get('Amount');
      const phone = get('PhoneNumber');

      console.log('[M-Pesa callback SUCCESS]', {
        MerchantRequestID,
        CheckoutRequestID,
        mpesaCode,
        amount,
        phone,
      });

      // In a more complete implementation you could auto-update the listing here
      // For now the user enters the code manually in the UI
    } else {
      console.log('[M-Pesa callback FAILED]', { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc });
    }

    // Always return success to Safaricom
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('[M-Pesa callback error]', err);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
