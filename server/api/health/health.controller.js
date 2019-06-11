const {
  sequelize,
} = require('../../conn/sqldb');

exports.health = async (req, res, next) => {
  try {
    await sequelize.authenticate();

    return res.json({ db: true });
  } catch (err) {
    return next(err);
  }
};
