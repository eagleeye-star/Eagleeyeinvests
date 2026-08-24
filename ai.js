/* EagleEyE — /api/ai
   Proxies requests to Anthropic API — avoids CORS issues from browser
   Premium only — validated server-side
*/
const { toEvent, send } = require('../lib/adapter');

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const SB_URL        = process.env.SUPABASE_URL || 'https://jyhamtniuhlsbwcdfspa.supabase.co';
const SB_ANON       = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5aGFtdG5pdWhsc2J3Y2Rmc3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNjE1MTgsImV4cCI6MjA5NzczNzUxOH0.1nT-wpRjjAIpgUk_BDTlu3z4Cvuz_G0nKX9l65cwpF0';

module.exports = async function(req, res) {
  const event = await toEvent(req);

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    const body = JSON.parse(event.body || '{}');
    const { system, messages, model = 'claude-sonnet-4-6', max_tokens = 500 } = body;

    if (!messages || !messages.length) {
      res.status(400).json({ error: 'Messages required.' });
      return;
    }

    if (!ANTHROPIC_KEY) {
      res.status(500).json({ error: 'AI service not configured.' });
      return;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, max_tokens, system, messages }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic error:', data);
      res.status(response.status).json({ error: data.error?.message || 'AI request failed.' });
      return;
    }

    res.status(200).json({ content: data.content });

  } catch (err) {
    console.error('AI proxy error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
};

module.exports.config = { api: { bodyParser: false } };
