import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const ADMIN_PIN = process.env.ADMIN_PIN || '0784';

function auth(req: NextRequest) {
  const pin =
    req.headers.get('x-admin-pin') ||
    req.headers.get('authorization')?.replace('Bearer ', '');
  return pin === ADMIN_PIN;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).length;
  return Math.max(3, Math.round(words / 200));
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

  const body = await req.json();
  const { topic, keywords, tone = 'friendly', length = 'standard' } = body;

  if (!topic) return NextResponse.json({ error: 'topic is required' }, { status: 400 });

  const wordTarget = length === 'short' ? '500-700' : length === 'long' ? '1200-1500' : '800-1000';

  const prompt = `You are an expert content writer for MyTinyverse, Nairobi's leading parent-to-parent marketplace for gently used kids' gear (bikes, strollers, toys, books, car seats, baby gear, shoes, playpens and more).

Write a ${tone} SEO blog article targeting Nairobi parents about:

TOPIC: ${topic}
${keywords ? `TARGET KEYWORDS: ${keywords}` : ''}
WORD COUNT: Approximately ${wordTarget} words

REQUIREMENTS:
- Write for Nairobi parents looking to buy, sell or donate kids' gear
- Include practical, locally relevant advice (mention Nairobi neighbourhoods, Kenyan context where appropriate)
- Naturally weave in references to buying/selling second-hand kids' items through trusted platforms like MyTinyverse
- Use clear headings (h2, h3) to structure the article
- Include a compelling introduction and a clear conclusion with a call to action
- Tone: ${tone === 'professional' ? 'Professional yet warm' : 'Friendly, conversational and helpful'}
- Return ONLY valid HTML (no markdown, no code blocks, no surrounding tags like <html> or <body>)
- Use only: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em> tags
- Do NOT include <html>, <head>, <body>, <article>, or <div> tags
- The first element must be an <h2> heading (not h1 -- the page template adds h1)

FORMAT your response as valid JSON with this exact structure:
{
  "title": "The full SEO article title (60-70 chars ideal)",
  "slug": "url-friendly-slug-here",
  "excerpt": "A compelling 150-160 character meta description / excerpt for the article",
  "meta_title": "SEO optimised title (50-60 chars, include main keyword)",
  "meta_description": "Meta description 150-160 chars with a clear benefit and call to action",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "content": "<h2>First heading...</h2><p>Article content here...</p>"
}`;

  try {
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI did not return valid JSON', raw }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Clean and validate
    const article = {
      title:            parsed.title || topic,
      slug:             parsed.slug ? slugify(parsed.slug) : slugify(parsed.title || topic),
      excerpt:          parsed.excerpt || '',
      meta_title:       parsed.meta_title || parsed.title || topic,
      meta_description: parsed.meta_description || parsed.excerpt || '',
      tags:             Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [],
      content:          parsed.content || '',
      reading_time_minutes: estimateReadingTime(parsed.content || ''),
      author:           'MyTinyverse Team',
    };

    return NextResponse.json({ article });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
