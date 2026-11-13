'use client';
import Link from 'next/link';

// Reusable 4-element empty state design contract:
//   1. SVG icon in warm gradient tile
//   2. Emotional headline
//   3. Context-aware body
//   4. Action stack (up to 3 CTAs)
// Optional: category/suggestion chips

export interface EmptyStateAction {
  label: string;
  variant: 'primary' | 'secondary' | 'ghost';
  href?: string;          // internal Next.js Link
  externalHref?: string;  // <a target="_blank"> for WhatsApp / external
  onClick?: () => void;   // button click (client components only)
  whatsapp?: boolean;     // adds WhatsApp logo + green color
}

export interface EmptyStateChip {
  label: string;
  iconPath: string;
  href?: string;
  onClick?: () => void;
}

export interface EmptyStateProps {
  iconPath: string;
  iconPath2?: string;    // second SVG path for multi-path icons
  iconViewBox?: string;  // defaults to '0 0 24 24'
  headline: string;
  body: string;
  actions: EmptyStateAction[];
  chips?: EmptyStateChip[];
  chipsLabel?: string;
  compact?: boolean;     // reduces vertical padding for inline use
}

// WhatsApp logo SVG path (single fill path)
const WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';

export default function EmptyState({
  iconPath,
  iconPath2,
  iconViewBox = '0 0 24 24',
  headline,
  body,
  actions,
  chips,
  chipsLabel = 'Also explore:',
  compact = false,
}: EmptyStateProps) {
  const pt = compact ? 40 : 68;
  const pb = compact ? 40 : 68;

  // Shared button shape
  const baseBtn: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    padding: '11px 22px',
    borderRadius: '999px',
    font: '600 14px Outfit,sans-serif',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'opacity .15s, background .15s',
    width: '100%',
    boxSizing: 'border-box',
    border: 'none',
    lineHeight: 1.2,
  };

  function variantStyle(v: EmptyStateAction['variant'], wa?: boolean): React.CSSProperties {
    if (v === 'primary') return { background: 'var(--orange)', color: '#fff' };
    if (v === 'secondary') return {
      background: 'transparent', color: 'var(--orange)',
      border: '1.5px solid var(--orange)',
    };
    // ghost
    return {
      background: 'transparent',
      color: wa ? '#25D366' : 'var(--text-2)',
      border: '1.5px solid var(--border)',
    };
  }

  function renderAction(action: EmptyStateAction, i: number) {
    const style: React.CSSProperties = {
      ...baseBtn,
      ...variantStyle(action.variant, action.whatsapp),
    };

    const inner = (
      <>
        {action.whatsapp && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" style={{ flexShrink: 0 }}>
            <path d={WA_PATH} />
          </svg>
        )}
        {action.label}
      </>
    );

    if (action.externalHref) {
      return (
        <a key={i} href={action.externalHref} target="_blank" rel="noopener noreferrer" style={style}>
          {inner}
        </a>
      );
    }
    if (action.href) {
      return (
        <Link key={i} href={action.href} style={style}>
          {inner}
        </Link>
      );
    }
    return (
      <button key={i} onClick={action.onClick} style={style}>
        {inner}
      </button>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: `${pt}px 20px ${pb}px`,
    }}>

      {/* Icon tile - warm gradient rounded square */}
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 20,
        background: 'linear-gradient(140deg, #FFF4EE 0%, #FFE0C0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 22,
        flexShrink: 0,
        boxShadow: '0 2px 12px rgba(240,120,40,.12)',
      }}>
        <svg
          width="38"
          height="38"
          viewBox={iconViewBox}
          fill="none"
          stroke="#F07828"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={iconPath} />
          {iconPath2 && <path d={iconPath2} />}
        </svg>
      </div>

      {/* Headline */}
      <h2 style={{
        font: '700 20px/1.3 Outfit,sans-serif',
        color: 'var(--text-1)',
        margin: '0 0 10px',
        maxWidth: 300,
      }}>
        {headline}
      </h2>

      {/* Body */}
      <p style={{
        font: '400 14px/1.65 Outfit,sans-serif',
        color: 'var(--text-3)',
        margin: '0 0 28px',
        maxWidth: 290,
      }}>
        {body}
      </p>

      {/* Action stack */}
      {actions.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          width: '100%',
          maxWidth: 288,
        }}>
          {actions.map(renderAction)}
        </div>
      )}

      {/* Suggestion chips */}
      {chips && chips.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <p style={{
            font: '500 11px Outfit,sans-serif',
            color: 'var(--text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: '0 0 10px',
          }}>
            {chipsLabel}
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'center',
          }}>
            {chips.map((chip, i) => {
              const chipStyle: React.CSSProperties = {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '7px 14px',
                borderRadius: '999px',
                border: '1.5px solid var(--border)',
                background: '#fff',
                font: '500 13px Outfit,sans-serif',
                color: 'var(--text-2)',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'border-color .15s',
              };
              const icon = (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={chip.iconPath} />
                </svg>
              );
              if (chip.href) {
                return (
                  <Link key={i} href={chip.href} style={chipStyle}>
                    {icon}{chip.label}
                  </Link>
                );
              }
              return (
                <button key={i} onClick={chip.onClick} style={chipStyle}>
                  {icon}{chip.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
