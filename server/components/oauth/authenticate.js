const oAuth = require('./');

module.exports = () => (req, res, next) => {
  if (req.user) return next();
  return oAuth.authorise()(req, res, (data) => {
    if (req.user) {
      req.user.app_id = req.oauth.bearerToken.app_id;
    }
    return next(data);
  });
};
