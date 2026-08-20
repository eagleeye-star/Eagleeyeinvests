/* EagleEyE — paystack-init
   POST /api/paystack-init
   Body: { plan, email }
   Returns: { authorization_url, reference }
   
   Add PAYSTACK_SECRET_KEY to Netlify environment variables.
   Get it from: dashboard.paystack.com → Settings → API Keys
*/
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SITE_URL = 'https://eagleeyeinvests.com';

const PLANS = {
  monthly:   { amount: 3500,  label: 'Monthly',   months: 1  }, // amount in pesewas (GHS * 100)
  quarterly: { amount: 9500,  label: 'Quarterly',  months: 3  },
  yearly:    { amount: 35000, label: 'Yearly',     months: 12 },
};

module.exports = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const token = (event.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Not authenticated.' }) };

  try {
    // Get user
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { 'apikey': process.env.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` }
    });
    if (!userRes.ok) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Session expired.' }) };
    const user = await userRes.json();

    const { plan } = JSON.parse(event.body);
    if (!PLANS[plan]) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid plan.' }) };

    const planInfo = PLANS[plan];
    const reference = `EE-${Date.now()}-${user.id.substring(0, 8)}`;

    // Initialise Paystack transaction
    const psRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: planInfo.amount,
        reference,
        currency: 'GHS',
        callback_url: `${SITE_URL}/payment-success.html`,
        metadata: {
          user_id: user.id,
          plan,
          months: planInfo.months,
          custom_fields: [
            { display_name: 'Plan', variable_name: 'plan', value: planInfo.label },
            { display_name: 'User ID', variable_name: 'user_id', value: user.id },
          ]
        }
      }),
    });

    const psData = await psRes.json();
    if (!psData.status) return { statusCode: 400, headers, body: JSON.stringify({ error: psData.message || 'Paystack error.' }) };

    // Save pending subscription record
    await fetch(`${SUPABASE_URL}/rest/v1/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id: user.id,
        paystack_ref: reference,
        plan,
        amount: planInfo.amount / 100,
        status: 'pending',
      }),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        authorization_url: psData.data.authorization_url,
        reference,
        plan: planInfo.label,
        amount: planInfo.amount / 100,
      }),
    };

  } catch (err) {
    console.error('paystack-init error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error.' }) };
  }
};
