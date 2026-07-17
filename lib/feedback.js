/* EagleEyE — feedback
   POST /api/feedback
   Body: { rating, category, message, email, page }
   Auth optional — works for logged-in and logged-out users
*/
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

module.exports = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { rating, category, message, email, page } = JSON.parse(event.body);

    if (!message || message.trim().length < 3) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Please enter a message.' }) };
    }
    if (rating && (rating < 1 || rating > 5)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Rating must be between 1 and 5.' }) };
    }

    // Get user_id if logged in
    let user_id = null;
    const token = (event.headers.authorization || '').replace('Bearer ', '').trim();
    if (token) {
      try {
        const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` }
        });
        if (userRes.ok) {
          const user = await userRes.json();
          user_id = user.id || null;
        }
      } catch (e) {}
    }

    // Insert feedback using service key (bypasses RLS for insert)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id,
        page: page || 'unknown',
        rating: rating || null,
        category: category || 'General',
        message: message.trim(),
        email: email || null,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Feedback insert error:', err);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Could not save feedback.' }) };
    }

    return { statusCode: 201, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Feedback function error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error.' }) };
  }
};
