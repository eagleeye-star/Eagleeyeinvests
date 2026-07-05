const { toEvent, send } = require('../lib/adapter');
const handler = require('../lib/news');
module.exports = async function(req, res) {
  const event = await toEvent(req);
  const result = await handler(event);
  send(res, result);
};
