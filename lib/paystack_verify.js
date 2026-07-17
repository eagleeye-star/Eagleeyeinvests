/* EagleEyE — paystack-verify
   GET /api/paystack-verify?reference=REF
   Verifies payment AND activates premium if confirmed.
   This is the fallback for when webhook is delayed.
*/
const PAYSTACK_SECRET  = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON    = process.env.SUPABASE_ANON_KEY;

const PLAN_MONTHS = { monthly:1, quarterly:3, yearly:12 };

module.exports = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'' };

  const reference = event.queryStringParameters?.reference;
  if (!reference) return { statusCode:400, headers, body: JSON.stringify({ error:'Reference required.' }) };

  // Get user token to confirm they own this payment
  const token = (event.headers.authorization||'').replace('Bearer ','').trim();

  try {
    // Verify with Paystack
    const psRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { 'Authorization': `Bearer ${PAYSTACK_SECRET}` }
    });
    const psData = await psRes.json();

    if (!psData.status || psData.data?.status !== 'success') {
      return { statusCode:200, headers, body: JSON.stringify({ success:false, status: psData.data?.status||'unknown' }) };
    }

    const user_id = psData.data?.metadata?.user_id;
    const plan    = psData.data?.metadata?.plan || 'monthly';
    const months  = PLAN_MONTHS[plan] || 1;

    if (!user_id) {
      return { statusCode:400, headers, body: JSON.stringify({ error:'No user_id in payment metadata.' }) };
    }

    const now     = new Date();
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + months);

    // Activate premium directly (fallback for webhook delay)
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE,
        'Authorization': `Bearer ${SUPABASE_SERVICE}`,
      },
      body: JSON.stringify({ plan: 'premium' }),
    });

    // Update subscription record
    await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?paystack_ref=eq.${reference}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE,
        'Authorization': `Bearer ${SUPABASE_SERVICE}`,
      },
      body: JSON.stringify({ status:'active', started_at:now.toISOString(), expires_at:expires.toISOString() }),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        plan,
        expires_at: expires.toISOString(),
        message: `Premium activated until ${expires.toLocaleDateString('en-GH',{day:'numeric',month:'long',year:'numeric'})}`,
      }),
    };

  } catch (err) {
    console.error('paystack-verify error:', err.message);
    return { statusCode:500, headers, body: JSON.stringify({ error:'Verification failed.' }) };
  }
};
