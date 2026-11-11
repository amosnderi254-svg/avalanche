'use client';
import { useState, useRef, useEffect } from 'react';
import type { NayaMessage } from '@/types';

const NAYA_GREETING = "Hi! I'm Naya, your MyTinyverse assistant. I can help you find the right kids' gear, give tips on what to look for when buying second-hand, or answer any questions about buying and selling on Tinyverse.";

export default function NayaChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<NayaMessage[]>([
    { role: 'assistant', content: NAYA_GREETING },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg: NayaMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch('/api/naya', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, I could not respond just now.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error -- please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 200,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--orange)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(240,120,40,.35)',
          cursor: 'pointer', color: '#fff',
          transition: 'transform .2s',
        }}
        aria-label="Chat with Naya"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l4.93-1.37A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 92, right: 24, zIndex: 200,
          width: 340, maxWidth: 'calc(100vw - 32px)',
          background: '#fff', borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,.15)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', border: '1px solid var(--border)',
        }}>
          {/* Header */}
          <div style={{ background: 'var(--orange)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              N
            </div>
            <div>
              <p style={{ font: '700 14px Outfit,sans-serif', color: '#fff', margin: 0 }}>Naya</p>
              <p style={{ font: '400 11px Outfit,sans-serif', color: 'rgba(255,255,255,.8)', margin: 0 }}>MyTinyverse AI</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '9px 13px',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.role === 'user' ? 'var(--orange)' : '#f2f2f2',
                  color: m.role === 'user' ? '#fff' : 'var(--text-1)',
                  font: '400 13px Outfit,sans-serif',
                  lineHeight: 1.5,
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '9px 16px', borderRadius: '18px 18px 18px 4px', background: '#f2f2f2' }}>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}/>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Ask Naya anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              style={{
                flex: 1, height: 38, padding: '0 12px',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--r-pill)',
                font: '400 13px Outfit,sans-serif',
                color: '#111', background: '#fafafa',
                outline: 'none',
              }}
            />
            <button onClick={send} disabled={loading || !input.trim()} className="btn btn-primary btn-sm" style={{ padding: '0 14px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
