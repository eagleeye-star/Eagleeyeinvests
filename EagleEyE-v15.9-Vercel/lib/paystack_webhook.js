/* EagleEyE — paystack-webhook
   POST /api/paystack-webhook
   
   KEY FIX: Hash must be computed on event.body (raw string)
   NOT on JSON.stringify(JSON.parse(event.body)) — that can
   alter whitespace/key order and break signature verification.
   
   PAYSTACK_WEBHOOK_SECRET = your Live Secret Key (same key,
   Paystack has no separate webhook secret).
*/
const crypto = require('crypto');

const PAYSTACK_SECRET  = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY;

const PLAN_MONTHS = { monthly:1, quarterly:3, yearly:12 };

module.exports = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // ---- Verify Paystack signature using the RAW body string ----
  const rawBody   = event.body;                          // already a string in Netlify
  const signature = event.headers['x-paystack-signature'];

  if (!signature) {
    console.error('Webhook: missing x-paystack-signature header');
    return { statusCode: 400, body: 'Missing signature' };
  }

  const expectedHash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(rawBody)                                     // use raw string, not re-serialised JSON
    .digest('hex');

  if (expectedHash !== signature) {
    console.error('Webhook: signature mismatch');
    console.error('Expected:', expectedHash.substring(0,20)+'...');
    console.error('Got:     ', signature.substring(0,20)+'...');
    return { statusCode: 400, body: 'Invalid signature' };
  }

  // ---- Parse payload ----
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  console.log('Webhook event received:', payload.event);

  // Only handle charge.success
  if (payload.event !== 'charge.success') {
    return { statusCode: 200, body: JSON.stringify({ ignored: true, event: payload.event }) };
  }

  const { reference, status, metadata } = payload.data || {};

  if (status !== 'success') {
    return { statusCode: 200, body: 'Not a success status' };
  }

  const user_id = metadata?.user_id;
  const plan    = metadata?.plan || 'monthly';
  const months  = PLAN_MONTHS[plan] || 1;

  if (!user_id) {
    console.error('Webhook: no user_id in metadata', metadata);
    return { statusCode: 400, body: 'No user_id in metadata' };
  }

  const now     = new Date();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + months);

  try {
    // 1. Update subscription to active
    const subRes = await fetch(
      `${SUPABASE_URL}/rest/v1/subscriptions?paystack_ref=eq.${reference}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE,
          'Authorization': `Bearer ${SUPABASE_SERVICE}`,
        },
        body: JSON.stringify({
          status:     'active',
          started_at: now.toISOString(),
          expires_at: expires.toISOString(),
        }),
      }
    );
    console.log('Subscription update status:', subRes.status);

    // 2. Upgrade user profile to premium
    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user_id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE,
          'Authorization': `Bearer ${SUPABASE_SERVICE}`,
        },
        body: JSON.stringify({ plan: 'premium' }),
      }
    );
    console.log('Profile upgrade status:', profileRes.status);

    // 3. Log notification
    await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE,
        'Authorization': `Bearer ${SUPABASE_SERVICE}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id,
        type:  'payment',
        title: '⭑ Premium activated!',
        body:  `Your ${plan} plan is now active until ${expires.toLocaleDateString('en-GH', { day:'numeric', month:'long', year:'numeric' })}.`,
      }),
    });

    console.log(`✓ Premium activated for user ${user_id}, plan=${plan}, expires=${expires.toISOString()}`);
    return { statusCode: 200, body: JSON.stringify({ success: true, user_id, plan }) };

  } catch (err) {
    console.error('Webhook DB error:', err.message);
    return { statusCode: 500, body: 'Database error' };
  }
};
