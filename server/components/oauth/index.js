
const model = require('./model');
const oauth2Server = require('oauth2-server');

module.exports = oauth2Server({
  model,
  refreshTokenLifetime: 60 * 24 * 3600, // 60 days
  grants: ['authorization_code', 'password', 'refresh_token', 'client_credentials'],
  debug: true,
});
