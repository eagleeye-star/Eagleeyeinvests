/* EagleEyE — /api/admin-notify */
const { toEvent, send } = require('../lib/adapter');

const SB_URL     = process.env.SUPABASE_URL     || 'https://jyhamtniuhlsbwcdfspa.supabase.co';
const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY;
const SB_ANON    = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5aGFtdG5pdWhsc2J3Y2Rmc3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNjE1MTgsImV4cCI6MjA5NzczNzUxOH0.1nT-wpRjjAIpgUk_BDTlu3z4Cvuz_G0nKX9l65cwpF0';
const ADMIN_SECRET = process.env.ADMIN_SECRET;

module.exports = async function(req, res) {
  const event = await toEvent(req);

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  // Auth check
  const secret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    res.status(403).json({ error: 'Forbidden.' });
    return;
  }

  // Use service key if available, fall back to anon
  const KEY = SB_SERVICE || SB_ANON;
  const sbHeaders = {
    'Content-Type': 'application/json',
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`,
    'Prefer': 'return=representation',
  };

  const qs = event.queryStringParameters || {};

  try {
    // GET — history
    if (req.method === 'GET' && qs.action === 'history') {
      const r = await fetch(`${SB_URL}/rest/v1/admin_notifications?select=*&order=created_at.desc&limit=50`, { headers: sbHeaders });
      const data = await r.json();
      if (!r.ok) { res.status(200).json({ notifications: [], error: JSON.stringify(data) }); return; }
      res.status(200).json({ notifications: Array.isArray(data) ? data : [] });
      return;
    }

    // DELETE
    if (req.method === 'DELETE' && qs.id) {
      await fetch(`${SB_URL}/rest/v1/user_notifications?notification_id=eq.${qs.id}`, { method:'DELETE', headers: sbHeaders });
      await fetch(`${SB_URL}/rest/v1/admin_notifications?id=eq.${qs.id}`, { method:'DELETE', headers: sbHeaders });
      res.status(200).json({ success: true });
      return;
    }

    // POST — send
    if (req.method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { title, body: message, type='info', url=null, target='all' } = body;

      if (!title || !message) { res.status(400).json({ error: 'Title and body required.' }); return; }

      // Save admin notification
      const notifRes = await fetch(`${SB_URL}/rest/v1/admin_notifications`, {
        method: 'POST', headers: sbHeaders,
        body: JSON.stringify({ title, body: message, type, url, target }),
      });
      const notifText = await notifRes.text();
      let notifData;
      try { notifData = JSON.parse(notifText); } catch(e) { notifData = []; }

      if (!notifRes.ok) {
        res.status(500).json({ error: 'Failed to save notification: ' + notifText.substring(0,200) });
        return;
      }

      const notifId = Array.isArray(notifData) ? notifData[0]?.id : notifData?.id;
      if (!notifId) { res.status(500).json({ error: 'No notification ID returned.' }); return; }

      // Get target users
      let usersUrl = `${SB_URL}/rest/v1/profiles?select=id,plan`;
      if (target === 'premium') usersUrl += '&plan=eq.premium';
      if (target === 'free')    usersUrl += '&plan=neq.premium';

      const usersRes = await fetch(usersUrl, { headers: sbHeaders });
      const users = await usersRes.json();

      if (!Array.isArray(users) || users.length === 0) {
        res.status(200).json({ count: 0, notifId });
        return;
      }

      // Insert user notifications
      const userNotifs = users.map(u => ({
        user_id: u.id, notification_id: notifId,
        title, body: message, type, url, is_read: false,
      }));

      const unRes = await fetch(`${SB_URL}/rest/v1/user_notifications`, {
        method: 'POST',
        headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
        body: JSON.stringify(userNotifs),
      });

      if (!unRes.ok) {
        const unText = await unRes.text();
        res.status(500).json({ error: 'Failed to create user notifications: ' + unText.substring(0,200) });
        return;
      }

      res.status(200).json({ success: true, count: users.length, notifId });
      return;
    }

    res.status(405).json({ error: 'Method not allowed.' });

  } catch(err) {
    console.error('admin-notify error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports.config = { api: { bodyParser: false } };
