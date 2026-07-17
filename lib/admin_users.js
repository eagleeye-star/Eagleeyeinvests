/* EagleEyE — admin-users
   GET  /api/admin-users  → list all users + profiles
   POST /api/admin-users  → update a user's plan { user_id, plan }
   
   Protected by ADMIN_SECRET env variable — only you can call this.
   Add ADMIN_SECRET to Netlify environment variables.
*/
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

module.exports = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Secret',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  // Verify admin secret
  const secret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden.' }) };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Fetch all profiles with user data
      const profilesRes = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?select=id,first_name,last_name,phone,plan,created_at&order=created_at.desc`,
        { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
      );
      const profiles = await profilesRes.json();

      // Fetch auth users to get emails
      const authRes = await fetch(
        `${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`,
        { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
      );
      const authData = await authRes.json();
      const emailMap = {};
      (authData.users || []).forEach(u => { emailMap[u.id] = { email: u.email, last_sign_in: u.last_sign_in_at, confirmed: !!u.email_confirmed_at }; });

      // Merge
      const users = profiles.map(p => ({
        ...p,
        email: emailMap[p.id]?.email || '—',
        last_sign_in: emailMap[p.id]?.last_sign_in || null,
        confirmed: emailMap[p.id]?.confirmed || false,
      }));

      // Counts
      const total = users.length;
      const premium = users.filter(u => u.plan === 'premium').length;
      const free = users.filter(u => u.plan === 'free').length;

      return { statusCode: 200, headers, body: JSON.stringify({ users, stats: { total, premium, free, revenue: premium * 35 } }) };
    }

    if (event.httpMethod === 'POST') {
      const { user_id, plan } = JSON.parse(event.body);
      if (!user_id || !plan) return { statusCode: 400, headers, body: JSON.stringify({ error: 'user_id and plan required.' }) };
      if (!['free', 'premium'].includes(plan)) return { statusCode: 400, headers, body: JSON.stringify({ error: 'plan must be free or premium.' }) };

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user_id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ plan }),
        }
      );
      if (!res.ok) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Could not update plan.' }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed.' }) };
  } catch (err) {
    console.error('admin-users error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error.' }) };
  }
};
