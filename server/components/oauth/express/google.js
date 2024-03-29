const debug = require('debug');
const rp = require('request-promise');
const env = require('../../../config/environment');
const logger = require('../../../components/logger');
const userService = require('../../../api/user/user.service');
const { User } = require('../../../conn/sqldb');

const log = debug('s.components.oauthjs.express.google');

exports.login = (req, res) => {
  const path = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=${env.auth.google.scope}&access_type=offline&redirect_uri=${env.auth.google.redirect_uri}&client_id=${env.auth.google.client_id}&include_granted_scopes=true`;
  res.writeHead(302, { Location: path });
  return res.end();
};

exports.oauth = (req, res, next) => {
  log('googleLogin', req.body);
  if (req.body.grant_type !== 'google') return next();
  return rp({
    method: 'POST',
    uri: 'https://www.googleapis.com/oauth2/v4/token',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: {
      grant_type: 'authorization_code',
      redirect_uri: env.auth.google.redirect_uri,
      client_id: env.auth.google.client_id,
      client_secret: env.auth.google.client_secret,
      code: req.body.code,
    },
    json: true,
  })
    .then((token) => {
      log('token recieved from google', token);
      return rp({
        method: 'GET',
        uri: 'https://www.googleapis.com/plus/v1/people/me',
        headers: { Authorization: `Bearer ${token.access_token}` },
        json: true,
      })
        .then((me) => {
          const email = me.emails.filter(x => (x.type === 'account'))[0].value;
          req.body.grant_type = 'password';
          req.body = { username: email, password: env.MASTER_TOKEN };
          log('AFTER GOOGLE LOGIN', req.body, me);

          return userService
            .signup({
              body: {
                email,
                salutation: '',
                first_name: me.name.givenName,
                last_name: me.name.familyName,
                hooks: false,
              },
            })
            .then((result) => {
              if (result.code === 409) {
                User
                  .update({
                    profile_photo_url: me.image.url,
                    google: { ...me, token },
                  }, { where: { email } })
                  .catch(err => logger.error('User me save', err, req.body));
              }

              return next();
            });
        });
    })
    .catch((err) => {
      log('error while google login', err);
      logger.error('error while google login', err);
      return res.status(400).json(err);
    });
};
