export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/shop-auth';

// POST /api/my-shop/logout
export async function POST() {
  return NextResponse.json(
    { ok: true },
    { headers: { 'Set-Cookie': clearSessionCookie() } }
  );
}
