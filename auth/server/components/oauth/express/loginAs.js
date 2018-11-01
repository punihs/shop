const debug = require('debug');
const rp = require('request-promise');

const {
  App,
} = require('./../../../conn/sqldb');
const { ip, port, MASTER_TOKEN } = require('../../../config/environment');

const log = debug('server-components-oauth-express-loginAs');

const getClientByUsername = (username) => {
  log('getClientByUsername', username);
  return App.find({
    attributes: ['client_id', 'client_secret', 'redirect_uri'],
    where: {
      id: 1,
    },
    raw: true,
  });
};

module.exports = (req, res, next) => {
  if (req.body.grant_type !== 'loginAs') return next();
  const getToken = (username) => {
    const options = {
      method: 'POST',
      url: `http://${ip}:${port}/oauth/token`,
      resolveWithFullResponse: true,
      headers: {
        'user-agent': 'Shoppre Login As',
        'x-forwarded-for': req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      },
    };

    options.form = { username, password: MASTER_TOKEN };

    return rp(options)
      .then(response => JSON.parse(response.body).access_token);
  };

  return getToken(req.body.username)
    .then(accessToken => getClientByUsername(req.body.username)
      .then((app) => {
        req.headers.authorization = `Bearer ${accessToken}`;
        req.body.allow = 'true';
        req.body.response_type = 'code';
        req.body.client_id = app.client_id;
        req.body.redirect_uri = app.redirect_uri;
        next();
      }))
    .catch(next);
};
