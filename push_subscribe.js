/* EagleEyE — push-subscribe
   POST /api/push-subscribe  → save subscription
   DELETE /api/push-subscribe → remove subscription
*/
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

module.exports = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const token = (event.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Not authenticated.' }) };

  try {
    // Verify user
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` }
    });
    if (!userRes.ok) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Session expired.' }) };
    const user = await userRes.json();

    if (event.httpMethod === 'POST') {
      const { endpoint, p256dh, auth } = JSON.parse(event.body);
      if (!endpoint || !p256dh || !auth) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing push subscription fields.' }) };
      }
      // Upsert push subscription
      await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({ user_id: user.id, endpoint, p256dh, auth }),
      });
      return { statusCode: 201, headers, body: JSON.stringify({ success: true }) };
    }

    if (event.httpMethod === 'DELETE') {
      const { endpoint } = JSON.parse(event.body);
      await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`, {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` },
      });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed.' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error.' }) };
  }
};
