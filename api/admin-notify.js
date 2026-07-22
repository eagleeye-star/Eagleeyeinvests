/* EagleEyE — /api/admin-notify
   POST: Send in-app notification to users (no push subscription needed)
   GET:  Fetch notification history
   DELETE: Delete a notification
*/
const { toEvent, send } = require('../lib/adapter');

const SB_URL     = process.env.SUPABASE_URL     || 'https://jyhamtniuhlsbwcdfspa.supabase.co';
const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

module.exports = async function(req, res) {
  const event = await toEvent(req);
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  // Auth check
  const secret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    res.status(403).json({ error: 'Forbidden.' });
    return;
  }

  const qs = event.queryStringParameters || {};
  const sbHeaders = {
    'Content-Type': 'application/json',
    'apikey': SB_SERVICE,
    'Authorization': `Bearer ${SB_SERVICE}`,
  };

  // GET — fetch notification history (admin-created notifications)
  if (req.method === 'GET') {
    if (qs.action === 'history') {
      const r = await fetch(`${SB_URL}/rest/v1/admin_notifications?select=*&order=created_at.desc&limit=50`, {
        headers: sbHeaders
      });
      const data = await r.json();
      res.status(200).json({ notifications: Array.isArray(data) ? data : [] });
      return;
    }
  }

  // DELETE — remove notification
  if (req.method === 'DELETE' && qs.id) {
    await fetch(`${SB_URL}/rest/v1/admin_notifications?id=eq.${qs.id}`, {
      method: 'DELETE', headers: sbHeaders
    });
    await fetch(`${SB_URL}/rest/v1/user_notifications?notification_id=eq.${qs.id}`, {
      method: 'DELETE', headers: sbHeaders
    });
    res.status(200).json({ success: true });
    return;
  }

  // POST — send notification
  if (req.method === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { title, body: message, type='info', url=null, target='all' } = body;

    if (!title || !message) {
      res.status(400).json({ error: 'Title and body are required.' });
      return;
    }

    // 1. Save notification to admin_notifications table
    const notifRes = await fetch(`${SB_URL}/rest/v1/admin_notifications`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Prefer': 'return=representation' },
      body: JSON.stringify({ title, body: message, type, url, target, created_at: new Date().toISOString() }),
    });
    const notifData = await notifRes.json();
    const notifId = Array.isArray(notifData) ? notifData[0]?.id : notifData?.id;

    if (!notifId) {
      res.status(500).json({ error: 'Failed to save notification.' });
      return;
    }

    // 2. Get target users
    let usersUrl = `${SB_URL}/rest/v1/profiles?select=id,plan`;
    if (target === 'premium') usersUrl += '&plan=eq.premium';
    if (target === 'free')    usersUrl += '&plan=neq.premium';

    const usersRes = await fetch(usersUrl, { headers: sbHeaders });
    const users = await usersRes.json();

    if (!Array.isArray(users) || users.length === 0) {
      res.status(200).json({ count: 0, message: 'No users found for target.' });
      return;
    }

    // 3. Insert user_notifications for each user
    const userNotifs = users.map(u => ({
      user_id: u.id,
      notification_id: notifId,
      title,
      body: message,
      type,
      url,
      is_read: false,
      created_at: new Date().toISOString(),
    }));

    await fetch(`${SB_URL}/rest/v1/user_notifications`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
      body: JSON.stringify(userNotifs),
    });

    res.status(200).json({ success: true, count: users.length });
    return;
  }

  res.status(405).json({ error: 'Method not allowed.' });
};

module.exports.config = { api: { bodyParser: false } };
