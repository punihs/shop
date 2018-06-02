
const { App, User } = require('./../../../conn/sqldb');

module.exports = (req, res, next) => {
  if (req.body.grant_type) return next();
  return User
    .find({
      attributes: ['group_id'],
      where: {
        email: req.body.username,
      },
      raw: true,
    })
    .then(user => App
      .find({
        attributes: ['client_id', 'client_secret'],
        where: {
          group_id: (user && user.group_id) || 1,
        },
        raw: true,
      })
      .then((app) => {
        const { client_id: ci, client_secret: cs } = app;
        const base64 = Buffer.from(`${ci}:${cs}`).toString('base64');
        req.headers.authorization = `Basic ${base64}`;
        req.body.grant_type = 'password';
        return next();
      }));
};
