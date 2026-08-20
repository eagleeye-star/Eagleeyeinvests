const { toEvent, send } = require('../lib/adapter');
const handler = require('../lib/news');
module.exports = async function(req, res) {
  const event = await toEvent(req);
  const result = await handler(event);
  send(res, result);
};

// Tell Vercel not to pre-parse the request body
module.exports.config = { api: { bodyParser: false } };
