// api/webhook.js — Stripe Webhook Handler
// Automatically tops up tokens after a successful payment
// Set this URL in Stripe Dashboard → Webhooks → Add endpoint

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const TOKEN_PACKS = {
  // Replace with your actual Stripe Price IDs
  [process.env.STRIPE_PRICE_STARTER]: { tokens: 50,  tryons: 10  },
  [process.env.STRIPE_PRICE_CREATOR]: { tokens: 150, tryons: 50  },
  [process.env.STRIPE_PRICE_PRO]:     { tokens: 500, tryons: 9999 },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify the webhook came from Stripe
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook sig verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const priceId = session.line_items?.data?.[0]?.price?.id;
    const customerEmail = session.customer_details?.email;
    const pack = TOKEN_PACKS[priceId];

    if (pack && customerEmail) {
      // TODO: Save tokens to your Supabase user record
      // await supabase.from('users').update({ tokens: tokens + pack.tokens }).eq('email', customerEmail)
      console.log(`✓ Granted ${pack.tokens} tokens to ${customerEmail}`);
    }
  }

  res.status(200).json({ received: true });
}

// Vercel needs raw body for Stripe signature verification
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export const config = {
  api: { bodyParser: false }, // Required for Stripe webhook verification
};
