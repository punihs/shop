const fs = require('fs');
const debug = require('debug');
const rp = require('request-promise');

const { URLS_API, root } = require('../../config/environment');

const log = debug('conn.api.auth');

module.exports = ({
  req,
  grantType = 'client_credentials',
  username,
  password,
}) => {
  log('login', grantType);
  const options = {
    method: 'POST',
    url: `${URLS_API}/oauth/token`,
    auth: {
      user: 'www',
      pass: 'wwwsecret',
    },
    resolveWithFullResponse: true,
  };

  if (req) {
    req.headers = {
      'user-agent': req.headers['user-agent'],
      'x-forwarded-for': req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    };
  }

  options.form = { grant_type: grantType, redirect_uri: 'http://www.shoppre.test/access/oauth' };

  if (grantType !== 'client_credentials') {
    Object.assign(options.form, { username, password });
  }

  return rp(options)
    .then((response) => {
      fs.writeFile(`${root}/credentials.json`, response.body);
      return response.body;
    });
};
