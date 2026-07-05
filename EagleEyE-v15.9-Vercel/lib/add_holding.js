/* ============================================================
   EagleEyE — Netlify Function: add-holding
   Endpoint: POST /api/add-holding
   Headers: Authorization: Bearer <access_token>
   Body: { ticker, name, sector, shares, avg_cost }
   ============================================================ */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

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
    // Verify token and get user
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` },
    });
    if (!userRes.ok) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Session expired. Please log in again.' }) };
    const user = await userRes.json();

    const { ticker, name, sector, shares, avg_cost } = JSON.parse(event.body);

    // Validate
    if (!ticker || !name || !shares || !avg_cost) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ticker, name, shares and average cost are required.' }) };
    }
    if (isNaN(shares) || shares <= 0) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Shares must be a positive number.' }) };
    if (isNaN(avg_cost) || avg_cost <= 0) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Average cost must be a positive number.' }) };

    // Check if holding already exists for this user
    const existRes = await fetch(
      `${SUPABASE_URL}/rest/v1/holdings?user_id=eq.${user.id}&ticker=eq.${ticker.toUpperCase()}&select=id,shares,avg_cost`,
      { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` } }
    );
    const existing = await existRes.json();

    let result;
    if (existing.length > 0) {
      // Update existing holding — recalculate weighted average cost
      const old = existing[0];
      const newShares = parseFloat(old.shares) + parseFloat(shares);
      const newAvgCost = ((parseFloat(old.shares) * parseFloat(old.avg_cost)) + (parseFloat(shares) * parseFloat(avg_cost))) / newShares;

      const updateRes = await fetch(
        `${SUPABASE_URL}/rest/v1/holdings?id=eq.${old.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ shares: newShares, avg_cost: parseFloat(newAvgCost.toFixed(4)) }),
        }
      );
      result = await updateRes.json();
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, action: 'updated', holding: result[0] }) };
    } else {
      // Insert new holding
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/holdings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          user_id: user.id,
          ticker: ticker.toUpperCase(),
          name,
          sector: sector || 'Other',
          shares: parseFloat(shares),
          avg_cost: parseFloat(avg_cost),
        }),
      });
      result = await insertRes.json();
      return { statusCode: 201, headers, body: JSON.stringify({ success: true, action: 'created', holding: result[0] }) };
    }

  } catch (err) {
    console.error('add-holding error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Something went wrong. Please try again.' }) };
  }
};
