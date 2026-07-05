async function toEvent(req) {
  const chunks = [];
  await new Promise((resolve, reject) => {
    req.on('data', c => chunks.push(Buffer.from(c)));
    req.on('end', resolve);
    req.on('error', reject);
  });
  const body = Buffer.concat(chunks).toString('utf8');
  const url = new URL(req.url, 'http://localhost');
  const qsp = {};
  url.searchParams.forEach((v,k) => { qsp[k]=v; });
  return { httpMethod:req.method||'GET', headers:req.headers||{}, body, queryStringParameters:qsp };
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
