const { toEvent, send } = require('../lib/adapter');
const signup = require('../lib/signup');
const login = require('../lib/login');
const getUser = require('../lib/get_user');
module.exports = async function(req, res) {
  const event = await toEvent(req);
  const url = req.url || '';
  let result;
  if (url.includes('signup'))      result = await signup(event);
  else if (url.includes('login'))  result = await login(event);
  else                             result = await getUser(event);
  send(res, result);
};

// Tell Vercel not to pre-parse the request body
module.exports.config = { api: { bodyParser: false } };
