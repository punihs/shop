
const { Customer } = require('../../conn/sqldb');

exports.me = (req, res) => res.json(req.user);

exports.create = async (req, res) => {
  const customer = await Customer.create(req.body);

  return res.json(customer);
};
