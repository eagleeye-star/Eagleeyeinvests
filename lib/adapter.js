async function toEvent(req) {
  let body = '';
  // Vercel sometimes pre-parses the body — check req.body first
  if (req.body !== undefined && req.body !== null) {
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  } else {
    // Fall back to reading raw stream
    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on('data', c => chunks.push(Buffer.from(c)));
      req.on('end', resolve);
      req.on('error', reject);
    });
    body = Buffer.concat(chunks).toString('utf8');
  }

  // Vercel rewrites strip query params from req.url — use x-now-route-matches or x-vercel-id
  // The original URL is preserved in req.headers['x-forwarded-host'] + req.url
  // Best approach: try req.url first, fallback to x-now-route-matches
  let rawUrl = req.url || '';

  // Vercel passes original path in x-now-route-matches or x-matched-path
  // But query string is preserved in req.url if we parse it correctly
  // Also check x-vercel-deployment-url header for the full original path
  const originalUrl = req.headers['x-original-url'] || req.headers['x-rewrite-url'] || rawUrl;

  const qsp = {};

  // Parse from req.url (works when no rewrite, or rewrite preserves query)
  try {
    const url = new URL(rawUrl, 'http://localhost');
    url.searchParams.forEach((v,k) => { qsp[k]=v; });
  } catch(e) {}

  // If no params found, try parsing from x-now-route-matches (Vercel internal)
  if (Object.keys(qsp).length === 0 && req.headers['x-now-route-matches']) {
    try {
      const matches = new URLSearchParams(req.headers['x-now-route-matches']);
      matches.forEach((v,k) => { if(k !== '__nextLocale' && k !== '__nextDefaultLocale') qsp[k]=v; });
    } catch(e) {}
  }

  // Final fallback: parse query string from the full original URL in referer or other headers
  if (Object.keys(qsp).length === 0) {
    const qs = rawUrl.includes('?') ? rawUrl.split('?')[1] : '';
    if (qs) {
      new URLSearchParams(qs).forEach((v,k) => { qsp[k]=v; });
    }
  }

  return {
    httpMethod: req.method || 'GET',
    headers: req.headers || {},
    body,
    queryStringParameters: qsp,
    url: rawUrl,
  };
}
function send(res, result) {
  if (!result) { res.status(200).end(); return; }
  const h = result.headers || {};
  // Prevent Vercel CDN from caching API responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  Object.entries(h).forEach(([k,v]) => res.setHeader(k,v));
  res.status(result.statusCode||200).send(result.body||'');
}
module.exports = { toEvent, send };
