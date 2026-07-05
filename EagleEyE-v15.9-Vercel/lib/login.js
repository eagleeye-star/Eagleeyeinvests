/* ============================================================
   EagleEyE — Netlify Function: login
   Endpoint: POST /api/login
   Body: { email, password }
   Returns: { access_token, user, profile }
   ============================================================ */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

module.exports = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and password are required.' }),
      };
    }

    // Authenticate with Supabase Auth
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    const authData = await authRes.json();

    if (!authRes.ok) {
      // Supabase returns "Invalid login credentials" for wrong email/password
      if (authData.error_description && authData.error_description.includes('Invalid')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Incorrect email or password. Please try again.' }),
        };
      }
      if (authData.error_description && authData.error_description.includes('Email not confirmed')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Please verify your email address before logging in. Check your inbox.' }),
        };
      }
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: authData.error_description || 'Login failed. Please try again.' }),
      };
    }

    const { access_token, refresh_token, user } = authData;

    // Fetch the user's profile (name, plan, etc.)
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${access_token}`,
      },
    });

    const profiles = await profileRes.json();
    const profile = profiles[0] || null;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        access_token,
        refresh_token,
        user: {
          id: user.id,
          email: user.email,
        },
        profile: profile ? {
          firstName:   profile.first_name,
          lastName:    profile.last_name,
          phone:       profile.phone,
          plan:        profile.plan,
          trialEndsAt: profile.trial_ends_at || null,
        } : null,
      }),
    };

  } catch (err) {
    console.error('Login function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Something went wrong. Please try again.' }),
    };
  }
};
