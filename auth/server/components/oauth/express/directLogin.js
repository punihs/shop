
const {
  App, AuthCode, RefreshToken,
} = require('./../../../conn/sqldb');

module.exports = (req, res, next) => {
  if (req.body.grant_type) return next();
  let promise;
  let grantType;
  if (req.body.code) {
    grantType = 'authorization_code';
    promise = Promise.resolve({
      include: [{
        model: AuthCode,
        where: { auth_code: req.body.code },
        required: true,
      }],
    });
  } else if (req.body.refresh_token) {
    grantType = 'refresh_token';
    promise = Promise.resolve({
      include: [{
        model: RefreshToken,
        where: { refresh_token: req.body.refresh_token },
        required: true,
      }],
    });
  } else {
    grantType = 'password';
    promise = Promise.resolve({
      attributes: ['client_id', 'client_secret'],
      where: {
        id: 1,
      },
      raw: true,
    });
  }

  return promise
    .then(option => App
      .find(option))
    .then((app) => {
      const { client_id: ci, client_secret: cs } = app;
      const base64 = Buffer.from(`${ci}:${cs}`).toString('base64');
      req.headers.authorization = `Basic ${base64}`;
      req.body.grant_type = grantType;
      return next();
    })
    .catch(next);
};
