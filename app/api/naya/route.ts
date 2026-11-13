export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Naya, the friendly AI assistant for MyTinyverse -- Nairobi's parent-to-parent marketplace for gently used kids' gear.

Your role:
- Help parents find the right second-hand gear for their children
- Give practical tips on what to look for when buying used bikes, strollers, car seats, toys, etc.
- Explain how to list items safely and at fair prices
- Answer questions about the marketplace (how it works, pricing, safety)
- Be warm, helpful, and concise -- parents are busy!

Key facts about MyTinyverse:
- Platform for Nairobi parents to buy, sell, or donate gently used kids' items
- Categories: bikes, scooters, strollers, car seats, toys, books, baby gear, shoes, clothing
- Listing fees: Free (donations/free items), KES 99 (items under KES 1,500), KES 299 (KES 1,500-8,000), KES 499 (over KES 8,000)
- Payment via M-Pesa: Lipa na M-Pesa, Buy Goods, Till 5002337 (Yumtyme Solutions)
- Buyers contact sellers directly via WhatsApp
- Listings reviewed by admin before going live (usually within 24 hours)
- Based in Nairobi, Kenya

Guidelines:
- Keep responses concise (2-4 sentences typically)
- Be practical and specific to Kenya/Nairobi context
- When in doubt, encourage the user to contact the admin via WhatsApp: +254 790 784 084
- Do NOT give financial, legal, or medical advice
- Do NOT make up specific listings or prices that aren't stated`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    // Keep last 10 messages to avoid token limits
    const recentMessages = messages.slice(-10);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: recentMessages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const reply = response.content[0]?.type === 'text'
      ? response.content[0].text
      : 'I could not respond just now. Please try again.';

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Naya is unavailable';
    return NextResponse.json({ error: message, reply: 'I\'m having trouble connecting right now. Please try again in a moment.' }, { status: 500 });
  }
}
