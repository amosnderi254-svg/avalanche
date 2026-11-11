'use client';
import { useState } from 'react';

interface Props {
  listingId: string;
  feeAmount: number;
  sellerPhone: string;
  onSuccess: (mpesaCode: string) => void;
  onCancel: () => void;
}

type Step = 'prompt' | 'stk_sent' | 'manual' | 'done';

export default function MpesaModal({ listingId, feeAmount, sellerPhone, onSuccess, onCancel }: Props) {
  const [step, setStep] = useState<Step>('prompt');
  const [phone, setPhone] = useState(sellerPhone);
  const [mpesaCode, setMpesaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendSTK() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount: feeAmount, listing_id: listingId, account_ref: 'TINY' }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('stk_sent');
      } else {
        setError(data.error || 'STK Push failed. Enter code manually.');
        setStep('manual');
      }
    } catch {
      setError('Could not reach payment service. Enter code manually.');
      setStep('manual');
    } finally {
      setLoading(false);
    }
  }

  function submit() {
    if (!mpesaCode.trim()) { setError('Enter your M-Pesa code'); return; }
    onSuccess(mpesaCode.trim().toUpperCase());
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '28px 24px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 16px 48px rgba(0,0,0,.2)',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#E8F5E9', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <path d="M2 10h20"/>
            </svg>
          </div>
          <h2 style={{ font: '700 18px Outfit,sans-serif', margin: '0 0 4px' }}>Listing Fee</h2>
          <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-3)', margin: 0 }}>
            KES {feeAmount} via Lipa na M-Pesa
          </p>
        </div>

        {/* M-Pesa details */}
        <div style={{ background: '#f9f9f7', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <p style={{ font: '600 12px Outfit,sans-serif', color: 'var(--text-3)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '.04em' }}>Payment Details</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-2)' }}>Till Number</span>
            <span style={{ font: '700 13px Outfit,sans-serif', color: 'var(--text-1)' }}>5002337</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-2)' }}>Business</span>
            <span style={{ font: '700 13px Outfit,sans-serif', color: 'var(--text-1)' }}>Yumtyme Solutions</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-2)' }}>Amount</span>
            <span style={{ font: '700 15px Outfit,sans-serif', color: 'var(--orange)' }}>KES {feeAmount}</span>
          </div>
        </div>

        {/* Step: prompt */}
        {step === 'prompt' && (
          <>
            <div className="field">
              <label>Your M-Pesa Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07XXXXXXXX"/>
            </div>
            <button className="btn btn-green btn-lg" style={{ width: '100%', marginBottom: 10 }} onClick={sendSTK} disabled={loading}>
              {loading ? <span className="spinner" style={{ width:18,height:18,borderWidth:2 }}/> : null}
              {loading ? 'Sending...' : `Send STK Push to ${phone}`}
            </button>
            <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={() => setStep('manual')}>
              I'll pay manually
            </button>
          </>
        )}

        {/* Step: STK sent */}
        {step === 'stk_sent' && (
          <>
            <div style={{ background: '#E8F5E9', borderRadius: 12, padding: 14, textAlign: 'center', marginBottom: 20 }}>
              <p style={{ font: '600 14px Outfit,sans-serif', color: '#2E7D32', margin: 0 }}>
                STK Push sent to {phone}
              </p>
              <p style={{ font: '400 12px Outfit,sans-serif', color: '#388E3C', margin: '4px 0 0' }}>
                Enter your M-Pesa PIN to complete payment, then enter the confirmation code below.
              </p>
            </div>
            <div className="field">
              <label>M-Pesa Confirmation Code</label>
              <input type="text" value={mpesaCode} onChange={e => setMpesaCode(e.target.value)}
                placeholder="e.g. RGH7K2XM3N" style={{ textTransform: 'uppercase', letterSpacing: '.1em' }}/>
            </div>
            {error && <p style={{ font:'400 12px Outfit,sans-serif', color:'#e53935', margin:'-8px 0 12px' }}>{error}</p>}
            <button className="btn btn-green btn-lg" style={{ width:'100%' }} onClick={submit}>
              Submit Listing
            </button>
          </>
        )}

        {/* Step: manual */}
        {step === 'manual' && (
          <>
            <p style={{ font: '400 13px Outfit,sans-serif', color: 'var(--text-2)', marginBottom: 16 }}>
              Pay KES {feeAmount} via M-Pesa: Go to M-Pesa &rarr; Lipa na M-Pesa &rarr; Buy Goods &rarr; Till <strong>5002337</strong>, then enter your confirmation code below.
            </p>
            <div className="field">
              <label>M-Pesa Confirmation Code</label>
              <input type="text" value={mpesaCode} onChange={e => setMpesaCode(e.target.value)}
                placeholder="e.g. RGH7K2XM3N" style={{ textTransform: 'uppercase', letterSpacing: '.1em' }}/>
            </div>
            {error && <p style={{ font:'400 12px Outfit,sans-serif', color:'#e53935', margin:'-8px 0 12px' }}>{error}</p>}
            <button className="btn btn-green btn-lg" style={{ width:'100%', marginBottom:10 }} onClick={submit}>
              Submit Listing
            </button>
          </>
        )}

        <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 8, color: 'var(--text-3)' }} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
