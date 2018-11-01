const oAuth = require('./../');

const { login } = require('./google');

module.exports = (a, routes) => {
  const app = a;
  app.oauth = oAuth;
  app.all('/oauth/google', login);
  // OAuth Authorise from Third party applications
  routes(app);
  app.use(app.oauth.errorHandler());
};
