const debug = require('debug');
const { User } = require('../../conn/sqldb');

const log = debug('s.user.controller');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'salutation', 'first_name', 'last_name', 'email'],
    limit: Number(req.query.limit) || 20,
  };

  return User
    .findAll(options)
    .then(users => res.json(users))
    .catch(next);
};

exports.me = (req, res, next) => {
  const options = {
    attributes: [
      'id', 'salutation', 'first_name', 'last_name', 'email', 'alternate_email',
      'phone_code', 'phone', 'secondary_phone_code', 'secondary_phone',
    ],
    limit: Number(req.query.limit) || 20,
  };

  return User
    .findById(req.user.id, options)
    .then(user => res.json(user))
    .catch(next);
};

exports.create = async (req, res) => {
  const user = req.body;
  const lockerCode = 'SHPR'.concat(parseInt(Math.random() * 100, 10)).concat(parseInt((Math.random() * (1000 - 100)) + 100, 10));
  user.locker_code = lockerCode;
  const saved = await User.create(user);
  return res.json(saved);
};

exports.show = (req, res, next) => {
  const { id } = req.params;
  log('show', id);
  return User
    .findById(Number(id))
    .then(users => res.json(users))
    .catch(next);
};

exports.unread = async (req, res) => {
  const { id } = req.params;
  const status = await User.update({ admin_read: 'no' }, { where: { id } });
  return res.json(status);
};

exports.update = (req, res, next) => {
  const id = req.params.id || req.user.id;
  return User
    .update(req.body, { where: { id } })
    .then(({ id: Id }) => res.json({ id: Id }))
    .catch(next);
};

exports.destroy = async (req, res) => {
  const { id } = req.params;
  const status = await User.destroy({
    paranoid: true,
    where: { id },
  });
  return res.json(status);
};
