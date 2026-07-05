const { toEvent, send } = require('../lib/adapter');
const pushSubscribe = require('../lib/push_subscribe');
const pushSend = require('../lib/push_send');
module.exports = async function(req, res) {
  const event = await toEvent(req);
  const url = req.url || '';
  let result;
  if (url.includes('push-send')) result = await pushSend(event);
  else                            result = await pushSubscribe(event);
  send(res, result);
};
