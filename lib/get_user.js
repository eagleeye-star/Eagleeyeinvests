/* ============================================================
   EagleEyE — Netlify Function: get-user
   Endpoint: GET /api/get-user
   Headers: Authorization: Bearer <access_token>
   Returns: { user, profile } or 401
   
   Called on every protected page load to verify the session.
   ============================================================ */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

module.exports = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' },
      body: '',
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // Extract Bearer token from Authorization header
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'No session token provided.' }),
    };
  }

  try {
    // Verify the token by fetching the user from Supabase
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!userRes.ok) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Session expired. Please log in again.' }),
      };
    }

    const user = await userRes.json();

    // Fetch profile
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    const profiles = await profileRes.json();
    const profile = profiles[0] || null;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: { id: user.id, email: user.email },
        profile: profile ? {
          firstName:   profile.first_name,
          lastName:    profile.last_name,
          plan:        profile.plan,
          trialEndsAt: profile.trial_ends_at || null,
        } : null,
      }),
    };

  } catch (err) {
    console.error('get-user error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error.' }),
    };
  }
};
