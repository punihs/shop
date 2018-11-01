
const {
  sequelize,
} = require('../../conn/sqldb');

exports.health = (req, res, next) => Promise
  .all([
    sequelize.authenticate(),
  ])
  .then(() => res.json({ db: true }))
  .catch(next);
