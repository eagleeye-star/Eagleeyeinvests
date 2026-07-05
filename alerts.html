/* EagleEyE — exchange-rate
   GET /api/exchange-rate
   Fetches live USD/GHS from open.er-api.com (free, no key required).
   Cached 6 hours via Netlify CDN.
   Source: https://www.exchangerate-api.com/docs/free
*/

module.exports = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=21600', // cache 6 hours
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      headers: { 'User-Agent': 'EagleEyE/1.0 (+https://eagleeyeinvests.com)' },
    });

    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();

    if (data.result !== 'success') throw new Error('API result not success');

    const ghs = data.rates?.GHS;
    if (!ghs) throw new Error('GHS rate not found in response');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        usd_ghs: parseFloat(ghs.toFixed(4)),
        last_updated: data.time_last_update_utc || new Date().toUTCString(),
        next_update: data.time_next_update_utc || null,
        source: 'open.er-api.com',
      }),
    };

  } catch (err) {
    console.error('exchange-rate error:', err.message);
    // Return fallback so the page still renders
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        usd_ghs: 11.22,
        last_updated: null,
        source: 'fallback',
        error: err.message,
      }),
    };
  }
};
