
const authorise = require('./authorise');
const authenticate = require('./../authenticate');
const oAuth = require('./../');
const directLogin = require('./directLogin');
const { oauth, login } = require('./google');
const db = require('./../../../conn/sqldb');

module.exports = (a, routes, rateLimit) => {
  const app = a;
  app.oauth = oAuth;
  // OAuth Token authorization_code, password, refresh_token
  app.all('/oauth/token', rateLimit, oauth, directLogin, app.oauth.grant());
  app.all('/oauth/google', login);

  app.all('/oauth/revoke', rateLimit, (req, res, next) => {
    db.RefreshToken
      .find({
        attributes: ['sessionId'],
        where: {
          refreshToken: req.body.token,
        },
        raw: true,
      })
      .then(s => (s && s.sessionId ? db.Session.logout(db, s.sessionId) : Promise.resolve()))
      .then(s => res.json(s))
      .catch(next);
  });
  app.all('/api/oauth/token', rateLimit, app.oauth.grant());

  // app.use(app.oauth.authorise('main'));

  // OAuth Authorise from Third party applications
  app.get('/authorise', rateLimit, authorise);

  app.post('/authorise', rateLimit, authenticate(), app.oauth.authCodeGrant((req, callback) => {
    if (req.body.allow !== 'true') return callback(null, false);
    return callback(null, true, req.user);
  }));
  // OAuth Authorise from Third party applications
  routes(app);
  app.use(app.oauth.errorHandler());
};
