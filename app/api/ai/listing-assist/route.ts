export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const CATEGORIES = ['bikes', 'scooters', 'strollers', 'car-seats', 'toys', 'books', 'baby-gear', 'shoes', 'clothing'] as const;
const CONDITIONS = ['like_new', 'good', 'fair'] as const;

export async function POST(req: NextRequest) {
  try {
    const { notes, imageUrls } = await req.json();

    if (!notes?.trim() && (!imageUrls || imageUrls.length === 0)) {
      return NextResponse.json({ error: 'Provide notes or at least one image' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Build message content
    const content: Anthropic.MessageParam['content'] = [];

    // Add images if provided (up to 3 to keep cost low)
    if (imageUrls?.length) {
      for (const url of imageUrls.slice(0, 3)) {
        content.push({
          type: 'image',
          source: { type: 'url', url },
        } as unknown as Anthropic.ImageBlockParam);
      }
    }

    // Add the text prompt
    content.push({
      type: 'text',
      text: `You are helping a Kenyan parent list a second-hand kids item on MyTinyverse, a Nairobi marketplace for gently used children's gear.

Seller's notes: "${notes?.trim() || '(no notes - analyse the image only)'}"

Write a listing for this item. Reply ONLY with a JSON object, no markdown, no explanation:

{
  "title": "specific title with brand/model/colour/size where visible (max 70 chars)",
  "category": "one of: bikes | scooters | strollers | car-seats | toys | books | baby-gear | shoes | clothing",
  "condition": "one of: like_new | good | fair",
  "description": "2-3 natural sentences. Mention age suitability if clear, any wear, what is included. No hype.",
  "price_suggestion": "KES range e.g. 2000-3500, or null if impossible to judge"
}

Rules:
- Title must be specific. Bad: 'Baby stroller'. Good: 'Graco Modes stroller, grey, folds flat'.
- Condition: like_new = barely used no visible wear, good = minor signs of use works perfectly, fair = visible wear fully functional.
- Description should sound like a real parent wrote it, not marketing copy.
- Category must be exactly one of the allowed values.
- Price in KES based on typical Nairobi second-hand market rates for kids items.`,
    });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      messages: [{ role: 'user', content }],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : '';

    // Strip markdown code fences if present
    const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(jsonText);

    // Validate and sanitise
    const title       = String(parsed.title || '').slice(0, 80);
    const category    = CATEGORIES.includes(parsed.category) ? parsed.category : null;
    const condition   = CONDITIONS.includes(parsed.condition) ? parsed.condition : null;
    const description = String(parsed.description || '').slice(0, 600);
    const price_suggestion = parsed.price_suggestion ? String(parsed.price_suggestion) : null;

    return NextResponse.json({ title, category, condition, description, price_suggestion });
  } catch (err: unknown) {
    console.error('[ai/listing-assist]', err);
    const message = err instanceof Error ? err.message : 'AI assist failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
