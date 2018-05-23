
const { App } = require('./../../../conn/sqldb');

module.exports = (req, res, next) => {
  if (req.body.grant_type) return next();
  return App.findById(1, { raw: true, attributes: ['client_id', 'client_secret'] })
    .then((app) => {
      const { client_id: ci, client_secret: cs } = app;
      const base64 = Buffer.from(`${ci}:${cs}`).toString('base64');
      req.headers.authorization = `Basic ${base64}`;
      req.body.grant_type = 'password';
      return next();
    });
};
