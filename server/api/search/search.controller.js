const db = require('./../../conn/sqldb');
const { sequelize } = require('./../../components/search');

exports.index = (req, res, next) => {
  if (!req.query.type) return res.status(400).end();
  const attributes = ['id', 'name'];
  let field = 'name';

  if (req.query.type === 'Customer') {
    attributes.push('locker');
    field = 'locker';
  }

  return sequelize(db[req.query.type], field, {
    attributes,
  })(req, res, next);
};
