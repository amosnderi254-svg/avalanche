# MyTinyverse V3 -- Setup Guide

A full-stack Next.js 14 marketplace for gently used kids items.
Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase, Anthropic (Naya AI), M-Pesa Daraja STK Push.

---

## Step 1 -- Create a Supabase project

1. Go to https://app.supabase.com and create a new project
2. Note down your project's:
   - Project URL (e.g. `https://xxxx.supabase.co`)
   - Anon/public key
   - Service role key (keep this secret)
3. In the Supabase Dashboard, open **SQL Editor** and paste the entire contents of `supabase/schema.sql`, then click **Run**
   - This creates the `listings` table, storage bucket, RLS policies, and seeds 8 sample listings

---

## Step 2 -- Get an Anthropic API key (Naya AI)

1. Go to https://console.anthropic.com/settings/keys
2. Create a new key -- name it "MyTinyverse Naya"
3. Save it as `ANTHROPIC_API_KEY`

---

## Step 3 -- Set up M-Pesa Daraja

### Sandbox (for testing)
1. Go to https://developer.safaricom.co.ke and sign up
2. Create an App and enable **Lipa Na M-Pesa (LNM)** APIs
3. Get `Consumer Key` and `Consumer Secret` from your App
4. Sandbox passkey: use the default from Daraja docs (for sandbox it is pre-set)
5. Set `MPESA_ENV=sandbox`

### Production (for live payments)
1. Apply for production access on the Daraja portal
2. Use your live credentials
3. Set your Till Number: `5002337` (Yumtyme Solutions -- already set in `lib/mpesa.ts`)
4. Set `MPESA_ENV=production`

> NOTE: M-Pesa STK Push requires a publicly accessible callback URL.
> The callback URL is `https://YOUR_DOMAIN/api/mpesa/callback`.
> This only works once deployed (not on localhost).
> During local testing, use a tool like ngrok to expose localhost.

---

## Step 4 -- Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

ANTHROPIC_API_KEY=sk-ant-...

MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=5002337
MPESA_PASSKEY=your_lnm_passkey
MPESA_ENV=sandbox

NEXT_PUBLIC_APP_URL=https://mytinyverse.vercel.app
ADMIN_PIN=0784
NEXT_PUBLIC_ADMIN_PIN=0784
ADMIN_WHATSAPP=254790784084
```

---

## Step 5 -- Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## Step 6 -- Deploy to Vercel

### Option A -- Vercel CLI (recommended)
```bash
npm i -g vercel
vercel login
vercel --prod
```

Add all environment variables in the Vercel dashboard:
**Project Settings -> Environment Variables**

Add each key from `.env.local`, marking all `NEXT_PUBLIC_*` vars as available to all environments.

### Option B -- GitHub integration
1. Push the project to a GitHub repo
2. Go to https://vercel.com/new and import the repo
3. Add environment variables during setup

After deployment, your site is live at `https://mytinyverse.vercel.app`

---

## Step 7 -- Post-deployment checklist

- [ ] Run `supabase/schema.sql` in your Supabase SQL editor
- [ ] Verify listings appear on the homepage
- [ ] Test submitting a listing (free/donation first)
- [ ] Test the Admin panel at `/admin` with PIN `0784`
- [ ] Approve a listing and confirm it goes live
- [ ] Test M-Pesa STK push with sandbox credentials
- [ ] Update `MPESA_ENV=production` and go live
- [ ] Set your real `NEXT_PUBLIC_APP_URL` to your deployed domain
- [ ] Change `ADMIN_PIN` and `NEXT_PUBLIC_ADMIN_PIN` from the default `0784` to something secure

---

## Admin panel

URL: `https://yourdomain.com/admin`
Default PIN: `0784` (change this before going live!)

The admin panel lets you:
- Review pending listings
- Approve (makes a listing live) or reject
- Delete any listing

---

## Fee structure

| Tier | Price range | Listing fee |
|------|-------------|-------------|
| Donation | KES 0 (free item) | KES 0 |
| Starter | Under KES 1,500 | KES 99 |
| Standard | KES 1,500 -- KES 8,000 | KES 299 |
| Premium | Over KES 8,000 | KES 499 |

Payments go to: **Lipa na M-Pesa -- Buy Goods -- Till 5002337 (Yumtyme Solutions)**

---

## Project structure

```
mytinyverse-v3/
-- app/
   -- page.tsx              # Home / browse listings
   -- layout.tsx            # Root layout + metadata
   -- globals.css           # Design tokens + global styles
   -- not-found.tsx         # Custom 404
   -- listing/[id]/page.tsx # Listing detail page
   -- sell/page.tsx         # Sell / list an item form
   -- admin/page.tsx        # Admin panel (PIN gated)
   -- api/
      -- listings/          # GET all, POST new
      -- listings/[id]/     # GET one, PATCH update
      -- admin/listings/    # Admin CRUD (PIN auth)
      -- naya/              # Anthropic AI proxy
      -- mpesa/stk-push/    # Initiate M-Pesa payment
      -- mpesa/callback/    # Safaricom callback handler
      -- upload/            # Image upload to Supabase Storage
-- components/
   -- Nav.tsx               # Sticky nav with search
   -- ListingCard.tsx       # Card with WhatsApp CTA
   -- ListingsPage.tsx      # Client-side browse/filter
   -- NayaChat.tsx          # Floating AI chat widget
   -- MpesaModal.tsx        # 3-step payment flow
-- lib/
   -- supabase.ts           # Client-side Supabase (anon key)
   -- supabase-server.ts    # Server-side Supabase (service role)
   -- mpesa.ts              # M-Pesa Daraja helpers
   -- constants.ts          # Categories, fee tiers
-- types/
   -- index.ts              # TypeScript interfaces
-- supabase/
   -- schema.sql            # Full DB schema + seed data
```

---

## WhatsApp admin CRM

All seller contact is via WhatsApp. The admin WhatsApp number is `254790784084`.
Buyers contact sellers directly via WhatsApp from listing cards and detail pages.

---

## Support

For questions, reach the admin via WhatsApp: https://wa.me/254790784084
