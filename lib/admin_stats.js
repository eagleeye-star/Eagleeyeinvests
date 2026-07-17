/* EagleEyE — admin-stats
   GET /api/admin-stats
   Returns platform stats: revenue, signups per day, plan breakdown
   Protected by ADMIN_SECRET
*/
const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_SECRET     = process.env.ADMIN_SECRET;

module.exports = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Secret',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const secret = event.headers['x-admin-secret'] || event.headers['X-Admin-Secret'];
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden.' }) };
  }

  try {
    // Fetch profiles
    const profilesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=id,plan,created_at,trial_ends_at&order=created_at.desc`,
      { headers: { 'apikey': SUPABASE_SERVICE, 'Authorization': `Bearer ${SUPABASE_SERVICE}` } }
    );
    const profiles = await profilesRes.json();

    // Fetch subscriptions
    const subsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/subscriptions?select=*&order=created_at.desc`,
      { headers: { 'apikey': SUPABASE_SERVICE, 'Authorization': `Bearer ${SUPABASE_SERVICE}` } }
    );
    const subs = await subsRes.json();

    // Fetch feedback count
    const fbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/feedback?select=id,rating,created_at`,
      { headers: { 'apikey': SUPABASE_SERVICE, 'Authorization': `Bearer ${SUPABASE_SERVICE}` } }
    );
    const feedback = await fbRes.json();

    // Compute stats
    const now = new Date();
    const total = profiles.length;
    const premium = profiles.filter(p => p.plan === 'premium').length;
    const free = profiles.filter(p => p.plan === 'free').length;
    const onTrial = profiles.filter(p => p.plan === 'free' && p.trial_ends_at && new Date(p.trial_ends_at) > now).length;

    // Revenue from active subscriptions
    const activeSubs = Array.isArray(subs) ? subs.filter(s => s.status === 'active') : [];
    const totalRevenue = activeSubs.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);

    // Monthly revenue estimate
    const monthlySubs = activeSubs.filter(s => s.plan === 'monthly').length;
    const quarterlySubs = activeSubs.filter(s => s.plan === 'quarterly').length;
    const yearlySubs = activeSubs.filter(s => s.plan === 'yearly').length;
    const mrr = (monthlySubs * 35) + (quarterlySubs * 31.67) + (yearlySubs * 29.17);

    // Signups per day (last 14 days)
    const signupsPerDay = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      signupsPerDay[key] = 0;
    }
    profiles.forEach(p => {
      const day = p.created_at?.split('T')[0];
      if (day && signupsPerDay.hasOwnProperty(day)) signupsPerDay[day]++;
    });

    // Feedback stats
    const fbWithRating = Array.isArray(feedback) ? feedback.filter(f => f.rating) : [];
    const avgRating = fbWithRating.length
      ? (fbWithRating.reduce((s, f) => s + f.rating, 0) / fbWithRating.length).toFixed(1)
      : null;

    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        users:   { total, premium, free, onTrial },
        revenue: { total: totalRevenue, mrr: Math.round(mrr), activeSubs: activeSubs.length, monthlySubs, quarterlySubs, yearlySubs },
        signupsPerDay,
        feedback: { total: feedback.length, avgRating },
        subscriptions: activeSubs,
      }),
    };
  } catch (err) {
    console.error('admin-stats error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error.' }) };
  }
};
