export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  // Guard against direct API abuse -- uploads must originate from the app.
  // This blocks curl/bot abuse while allowing browser requests from the sell page.
  const origin = req.headers.get('origin') || '';
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.co.ke').replace(/\/$/, '');
  const isLocalDev = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
  // Allow empty origin: iOS Safari omits Origin header on same-origin POST requests.
  // Only block when a non-empty origin is explicitly present and doesn't match our domain.
  if (origin && !isLocalDev && !origin.startsWith(appUrl)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Validate type — also check by extension because Android camera capture
    // sometimes returns an empty MIME type (file.type === '').
    const imgExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'avif'];
    const ext = (file.name.split('.').pop() || '').toLowerCase() || 'jpg';
    const isImage = file.type.startsWith('image/') || imgExts.includes(ext);
    if (!isImage) {
      return NextResponse.json({ error: 'Only images are allowed' }, { status: 400 });
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be under 5MB' }, { status: 400 });
    }

    const filename = `${uuidv4()}.${ext}`;
    // Use a sensible fallback when MIME type is empty (e.g. Android camera capture)
    const contentType = file.type || 'image/jpeg';

    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = createServerClient();
    const { error } = await supabase.storage
      .from('listing-images')
      .upload(filename, buffer, {
        contentType,
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('listing-images')
      .getPublicUrl(filename);

    return NextResponse.json({ url: urlData.publicUrl, filename });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
