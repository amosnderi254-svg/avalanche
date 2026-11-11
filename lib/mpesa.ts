import axios from 'axios';

const ENV = process.env.MPESA_ENV || 'sandbox';
const BASE_URL = ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

const CONSUMER_KEY    = process.env.MPESA_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!;
const SHORTCODE       = process.env.MPESA_SHORTCODE || '5002337';
const PASSKEY         = process.env.MPESA_PASSKEY!;

export async function getMpesaToken(): Promise<string> {
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const { data } = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  return data.access_token;
}

export async function initiateStkPush({
  phone,
  amount,
  accountRef,
  description,
  callbackUrl,
}: {
  phone: string;
  amount: number;
  accountRef: string;
  description: string;
  callbackUrl: string;
}) {
  const token = await getMpesaToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

  // Normalize phone: strip leading 0 and add 254
  const normalizedPhone = phone.replace(/^0/, '254').replace(/^\+/, '');

  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerBuyGoodsOnline',
    Amount: Math.ceil(amount),
    PartyA: normalizedPhone,
    PartyB: SHORTCODE,
    PhoneNumber: normalizedPhone,
    CallBackURL: callbackUrl,
    AccountReference: accountRef.slice(0, 12),
    TransactionDesc: description.slice(0, 13),
  };

  const { data } = await axios.post(
    `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data;
}
