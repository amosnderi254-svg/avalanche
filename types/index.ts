export type ListingStatus = 'pending' | 'live' | 'rejected';
export type Condition = 'like_new' | 'good' | 'fair';
export type FeeTier = 'donation' | 'starter' | 'standard' | 'premium';

export interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: Condition;
  description: string | null;
  location: string;
  seller_name: string;
  seller_phone: string;
  seller_whatsapp: string | null;
  seller_email: string | null;
  images: string[];
  status: ListingStatus;
  fee_tier: FeeTier | null;
  fee_amount: number;
  mpesa_code: string | null;
  edit_token: string | null;
  expires_at: string | null;
  views: number;
  whatsapp_clicks: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface NayaMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface MpesaSTKRequest {
  phone: string;
  amount: number;
  listing_id: string;
  account_ref: string;
}

export interface MpesaSTKResponse {
  success: boolean;
  checkout_request_id?: string;
  error?: string;
}

// ── Blog Articles ─────────────────────────────────────────
export type ArticleStatus = 'draft' | 'pending' | 'published';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  tags: string[];
  status: ArticleStatus;
  views: number;
  reading_time_minutes: number;
  author: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
