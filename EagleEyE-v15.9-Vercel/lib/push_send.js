/* EagleEyE — push-send
   POST /api/push-send
   Protected by ADMIN_SECRET.
   Body: { user_id (optional), type, title, body, url }
   If user_id is omitted, sends to ALL subscribed users.
   
   Requires: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, ADMIN_SECRET
   in Netlify environment variables.
*/
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

// Minimal Web Push implementation without npm dependency
// Uses the VAPID JWT + Encryption approach
async function sendPushNotification(subscription, payload) {
  const { endpoint, p256dh, auth } = subscription;
  // We use the Netlify web-push approach via native fetch to push service
  // For full encryption we'd need web-push npm — here we do a simplified version
  // that works when deployed with the web-push package bundled
  try {
    const webpush = require('web-push');
    webpush.setVapidDetails(
      'mailto:aifarms101@gmail.com',
      VAPID_PUBLIC,
      VAPID_PRIVATE
    );
    await webpush.sendNotification(
      { endpoint, keys: { p256dh, auth } },
      JSON.stringify(payload),
      { TTL: 86400 }
    );
    return true;
  } catch (err) {
    console.error('Push send error:', err.statusCode, err.message);
    return false;
  }
}

module.exports = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Secret',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed.' }) };

  // Auth: either admin secret or valid user token (for self-notifications)
  const adminSecret = event.headers['x-admin-secret'];
  const isAdmin = ADMIN_SECRET && adminSecret === ADMIN_SECRET;
  if (!isAdmin) return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden.' }) };

  try {
    const { user_id, type, title, body, url } = JSON.parse(event.body);

    // Fetch push subscriptions
    const query = user_id
      ? `${SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${user_id}&select=*`
      : `${SUPABASE_URL}/rest/v1/push_subscriptions?select=*`;

    const subRes = await fetch(query, {
      headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` }
    });
    const subs = await subRes.json();

    if (!subs.length) return { statusCode: 200, headers, body: JSON.stringify({ sent: 0, message: 'No subscribers.' }) };

    const payload = { title, body, url: url || 'https://eagleeyeinvests.com', icon: '/icon-192.png', badge: '/icon-72.png', type };

    let sent = 0, failed = 0;
    for (const sub of subs) {
      const ok = await sendPushNotification(sub, payload);
      if (ok) sent++;
      else failed++;
    }

    // Log notification in DB
    if (user_id) {
      await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ user_id, type, title, body }),
      });
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, sent, failed }) };
  } catch (err) {
    console.error('push-send error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error.' }) };
  }
};
