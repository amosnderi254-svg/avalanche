import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkAdminPin } from '@/lib/admin-auth';
import { getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';


const SYSTEM_PROMPT = `You are Naya, the MyTinyverse admin assistant. MyTinyverse is Nairobi's leading parent-to-parent marketplace for gently used kids' gear - bikes, strollers, toys, books, car seats, baby gear, shoes, playpens and more.

You help the admin (Amos) manage the marketplace. You can:
- Answer questions about listings, sellers, and marketplace trends
- Suggest pricing guidance for second-hand kids' items in Nairobi
- Help draft seller communications and responses
- Give category insights and demand analysis
- Advise on moderation decisions

Keep responses concise and practical. You know the Nairobi market well.`;

export async function POST(req: NextRequest) {
  const authResult = checkAdminPin(req.headers, getClientIp(req));
  if (!authResult.ok) return NextResponse.json({ error: authResult.message }, { status: authResult.status });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });

  const body = await req.json();
  const { message, history = [] } = body;

  if (!message) return NextResponse.json({ error: 'message is required' }, { status: 400 });

  try {
    const anthropic = new Anthropic({ apiKey });

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...history.slice(-10), // keep last 10 messages for context
      { role: 'user', content: message },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
