/* ============================================================
   EagleEyE — Netlify Function: signup
   Endpoint: POST /api/signup
   Body: { firstName, lastName, email, phone, password, plan }
   ============================================================ */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

module.exports = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // CORS headers — allow your Netlify domain
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { firstName, lastName, email, phone, password, plan = 'free' } = JSON.parse(event.body);

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'First name, last name, email and password are required.' }),
      };
    }
    if (password.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Password must be at least 8 characters.' }),
      };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Please enter a valid email address.' }),
      };
    }

    // Step 1: Create user in Supabase Auth using the admin (service role) API
    // We use the service key here so we can create the profile immediately
    // without waiting for email verification
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true, // auto-confirm email so users can login immediately
        user_metadata: { first_name: firstName, last_name: lastName },
      }),
    });

    const authData = await authRes.json();

    if (!authRes.ok) {
      // Handle common errors with friendly messages
      if (authData.message && authData.message.includes('already registered')) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ error: 'An account with this email already exists. Try logging in instead.' }),
        };
      }
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: authData.message || 'Could not create account. Please try again.' }),
      };
    }

    const userId = authData.id;

    // Step 2: Insert profile row into public.profiles
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        plan: 'free',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      }),
    });

    if (!profileRes.ok) {
      const profileErr = await profileRes.json();
      console.error('Profile insert error:', profileErr);
      // User was created in auth but profile failed — not ideal but recoverable
      // Log for debugging; user can still log in and profile will be created on first login
    }

    // Step 3: If premium plan selected, return a flag so frontend shows Paystack
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        userId,
        email,
        plan: 'free',
        trial: true,
        trialDays: 14,
        requiresPayment: false,
        message: 'Account created! You have 14 days of free Premium access. No card required.',
      }),
    };

  } catch (err) {
    console.error('Signup function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Something went wrong. Please try again.' }),
    };
  }
};
