const { toEvent, send } = require('../lib/adapter');
const saveSnapshot = require('../lib/save_snapshot');
const getHistory = require('../lib/get_history');
const updateGoal = require('../lib/update_goal');
module.exports = async function(req, res) {
  const event = await toEvent(req);
  const url = req.url || '';
  let result;
  if (url.includes('save-snapshot'))     result = await saveSnapshot(event);
  else if (url.includes('update-goal'))  result = await updateGoal(event);
  else                                   result = await getHistory(event);
  send(res, result);
};

// Tell Vercel not to pre-parse the request body
module.exports.config = { api: { bodyParser: false } };
