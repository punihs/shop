
const plivo = require('plivo');

const config = require('../../config/environment');

/* eslint new-cap:0 */
const api = plivo.RestAPI({
  authId: config.PLIVO_AUTH_ID || 'MANJI4OTU0NTHKMJGXNJ',
  authToken: config.PLIVO_AUTH_TOKEN || 'MGIyMzdmNjNmMzdlY2FhNDMzODU3ZmM2YTYwMjM5',
});

api.sendMessage = function (params) {
  return new Promise((res, rej) => {
    api.send_message(params, (status, response) => {
      if (status >= 400) return rej({ status, response });
      return res({ status, response });
    });
  });
};

exports.send = ({ from = '919844717202', to, text }) => {
  const params = {
    src: from,
    dst: to.toString().replace(/[^0-9]/g, ''),
    text,
  };

  return api.sendMessage(params);
};
