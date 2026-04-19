# Inkform — Complete Setup Guide
## From zero to live in under 1 hour

---

## YOUR FILE STRUCTURE
```
inkform/
├── index.html          ← full homepage (design + try-on)
├── vercel.json         ← Vercel config
├── SETUP.md            ← this file
└── api/
    ├── generate.js     ← tattoo image generation
    ├── remove-bg.js    ← background removal for try-on
    └── webhook.js      ← Stripe payment webhook
```

---

## STEP 1 — Create accounts (all free, 10 mins)

### fal.ai (image generation)
1. https://fal.ai → Sign up
2. Dashboard → API Keys → Create key
3. Save key: `fal-xxxxxxxx`
4. Cost: ~$0.004 per image generated

### Vercel (hosting)
1. https://vercel.com → Sign up with GitHub
2. Free plan is more than enough

### Stripe (payments)
1. https://stripe.com → Sign up
2. No monthly fee — they take 2.9% + $0.30 per transaction only

### Namecheap (domain)
1. https://namecheap.com → search "inkform.ai" or "inkform.co"
2. ~$12-15/year

---

## STEP 2 — Deploy to Vercel (5 mins)

### Option A: Drag & drop (easiest)
1. Go to vercel.com → New Project
2. Drag your `inkform` folder into the deploy area
3. Click Deploy
4. Get your URL: `inkform-xyz.vercel.app`

### Option B: CLI
```bash
npm install -g vercel
cd /path/to/inkform
vercel
# Follow prompts
```

---

## STEP 3 — Add environment variables (3 mins)

In Vercel dashboard → your project → Settings → Environment Variables

Add these:
```
FAL_API_KEY              = fal-your-key-here
STRIPE_SECRET_KEY        = sk_live_your-stripe-key
STRIPE_WEBHOOK_SECRET    = whsec_your-webhook-secret
STRIPE_PRICE_STARTER     = price_xxxxx  (from Stripe)
STRIPE_PRICE_CREATOR     = price_xxxxx
STRIPE_PRICE_PRO         = price_xxxxx
```

After adding — click **Redeploy** in Vercel.

---

## STEP 4 — Set up Stripe products (10 mins)

1. Stripe Dashboard → Products → Add Product

**Create 3 products:**

| Name     | Price | Type      | Tokens |
|----------|-------|-----------|--------|
| Starter  | $5    | One-time  | 50     |
| Creator  | $12   | One-time  | 150    |
| Pro      | $35   | One-time  | 500    |

2. For each product → click **Create Payment Link**
3. Copy the link (looks like: `https://buy.stripe.com/xxxxx`)

4. Open `index.html` → find this section near bottom:
```js
const links = {
  starter: 'https://buy.stripe.com/YOUR_STARTER_LINK',
  creator: 'https://buy.stripe.com/YOUR_CREATOR_LINK',
  pro:     'https://buy.stripe.com/YOUR_PRO_LINK',
};
```
Replace with your real links. Save. Redeploy.

---

## STEP 5 — Set up Stripe Webhook (5 mins)

This auto-tops-up user tokens after payment.

1. Stripe Dashboard → Developers → Webhooks → Add Endpoint
2. URL: `https://your-vercel-url.vercel.app/api/webhook`
3. Events to listen for: `checkout.session.completed`
4. Copy the **Signing Secret** (starts with `whsec_`)
5. Add it to Vercel env vars as `STRIPE_WEBHOOK_SECRET`

---

## STEP 6 — Connect your domain (5 mins)

1. Vercel → your project → Settings → Domains
2. Add: `inkform.ai` (or whatever you bought)
3. Follow DNS instructions (copy 2 records to Namecheap)
4. SSL is automatic and free
5. Live in ~10 minutes

---

## YOU'RE LIVE ✓

Users can now:
- Land on inkform.ai
- Describe their tattoo idea
- Use 8 free generations (tracked in their browser)
- Choose style, placement, size
- Get professional AI tattoo designs
- Upload a body photo + try the tattoo on
- Hit paywall → buy a token pack via Stripe
- Tokens auto-restore after payment (webhook)

---

## ECONOMICS

| Pack    | Price | Your API cost | Stripe fee | You keep |
|---------|-------|--------------|------------|----------|
| Starter | $5    | ~$0.20       | ~$0.45     | **$4.35 (87%)** |
| Creator | $12   | ~$0.60       | ~$0.65     | **$10.75 (90%)** |
| Pro     | $35   | ~$2.00       | ~$1.32     | **$31.68 (91%)** |

---

## NEXT STEPS (when ready)

1. **Add user accounts (Supabase)** — so tokens persist across devices
   → I can build this for you

2. **Add a gallery page** — showcase community designs, drives SEO
   → I can build this for you

3. **TikTok launch** — post one video showing a tattoo being generated
   → The "before (your idea) → after (the design)" format goes viral

4. **Artist mode** — special flow for tattoo artists designing for clients
   → I can build this for you

---

## SUPPORT
Any issues → come back to this conversation and describe what's happening.
I'll fix it instantly.
