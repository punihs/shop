
const authorise = require('./authorise');
const authenticate = require('./../authenticate');
const oAuth = require('./../');
const db = require('./../../../conn/sqldb');

module.exports = (a, routes) => {
  const app = a;
  app.oauth = oAuth;
  // OAuth Token authorization_code, password, refresh_token
  app.all('/oauth/token', app.oauth.grant());

  app.all('/oauth/revoke', (req, res, next) => {
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
  app.all('/api/oauth/token', app.oauth.grant());

  // app.use(app.oauth.authorise('main'));

  // OAuth Authorise from Third party applications
  app.get('/authorise', authorise);

  app.post('/authorise', authenticate(), app.oauth.authCodeGrant((req, callback) => {
    if (req.body.allow !== 'true') return callback(null, false);
    return callback(null, true, req.user);
  }));
  // OAuth Authorise from Third party applications
  routes(app);
  app.use(app.oauth.errorHandler());
};
