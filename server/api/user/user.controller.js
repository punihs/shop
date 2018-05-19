
const { User } = require('../../conn/sqldb');

exports.me = (req, res) => res.json(req.user);

exports.create = async (req, res) => {
  const user = await User.create(req.body);

  return res.json(user);
};
