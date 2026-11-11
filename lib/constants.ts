import type { Category } from '@/types';

export const CATEGORIES: Category[] = [
  { id: 'all',        label: 'All',          icon: '⊞' },
  { id: 'bikes',      label: 'Bikes',        icon: '🚲' },
  { id: 'scooters',   label: 'Scooters',     icon: '🛴' },
  { id: 'strollers',  label: 'Strollers',    icon: '🪑' },
  { id: 'car-seats',  label: 'Car Seats',    icon: '💺' },
  { id: 'toys',       label: 'Toys',         icon: '🧸' },
  { id: 'books',      label: 'Books',        icon: '📚' },
  { id: 'baby-gear',  label: 'Baby Gear',    icon: '🍼' },
  { id: 'shoes',      label: 'Shoes',        icon: '👟' },
  { id: 'clothing',   label: 'Clothing',     icon: '👕' },
];

// Listing fee tiers -- single source of truth
export const FEE_TIERS = {
  donation: { label: 'Donation',  max: 0,     fee: 0   },
  starter:  { label: 'Starter',   max: 1499,  fee: 99  },
  standard: { label: 'Standard',  max: 8000,  fee: 299 },
  premium:  { label: 'Premium',   max: Infinity, fee: 499 },
} as const;

export function getFeeTier(price: number) {
  if (price === 0) return { tier: 'donation' as const, fee: 0 };
  if (price < 1500) return { tier: 'starter' as const, fee: 99 };
  if (price <= 8000) return { tier: 'standard' as const, fee: 299 };
  return { tier: 'premium' as const, fee: 499 };
}

export const CONDITION_LABELS: Record<string, string> = {
  like_new: 'Like New',
  good:     'Good',
  fair:     'Fair',
};

export const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP || '254790784084';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mytinyverse.vercel.app';
