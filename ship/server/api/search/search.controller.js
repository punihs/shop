const db = require('./../../conn/sqldb');
const { sequelize } = require('./../../components/search');

exports.index = (req, res, next) => {
  if (!req.query.type) return res.status(400).end();
  let attributes = ['id', 'name'];
  let field = 'name';

  if (req.query.type === 'User') {
    attributes = ['id', 'last_name', 'first_name', 'virtual_address_code'];
    field = 'virtual_address_code';
  }

  return sequelize(db[req.query.type], field, {
    attributes,
  })(req, res, next);
};
