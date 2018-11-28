const WebHooks = require('node-webhooks');
const { root } = require('../config/environment');

const { log } = console;

const hookshot = new WebHooks({
  db: `${root}/subscriptions.json`,
  DEBUG: true,
});

const emitter = hookshot.getEmitter();

emitter.on('*.*', (shortname, statusCode, body) => {
  log('Success on trigger webHook', shortname, 'with status code', statusCode, 'and body', body);
});

module.exports = hookshot;

//
// exports.subscribe = (req, res, next) => {
//   switch (req.body.Protocol) {
//     case 'http': {
//       hookshot.add(req.body.TopicArn, req.body.Endpoint)
//         .then(() => res.end(responses.subscribe.success))
//         .catch(next);
//       break;
//     }
//     default: next();
//   }
// };
