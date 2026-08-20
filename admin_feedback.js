/* EagleEyE — admin-feedback
   GET /api/admin-feedback
   Returns all feedback submissions sorted newest first.
   Protected by ADMIN_SECRET.
*/
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

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
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/feedback?select=*&order=created_at.desc&limit=200`,
      { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
    );
    const data = await res.json();

    // Compute summary stats
    const total = data.length;
    const withRating = data.filter(f => f.rating);
    const avgRating = withRating.length
      ? (withRating.reduce((s, f) => s + f.rating, 0) / withRating.length).toFixed(1)
      : null;
    const categories = {};
    data.forEach(f => { categories[f.category] = (categories[f.category] || 0) + 1; });

    return {
      statusCode: 200, headers,
      body: JSON.stringify({ feedback: data, stats: { total, avgRating, categories } })
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error.' }) };
  }
};
