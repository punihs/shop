
const debug = require('debug');

const log = debug('package');

const db = require('../../../conn/sqldb');

const { Follower, User, SocketSession } = db;
const attributes = [
  'id', 'email', 'first_name', 'last_name', 'salutation', 'profile_photo_url', 'name',
];
exports.index = (req, res, next) => {
  log('index', req.query);

  return Follower
    .findAll({ where: { object_id: req.params.packageId } })
    .then((followers) => {
      if (!followers.length) return res.json([]);
      return User
        .findAll({
          attributes,
          where: {
            id: followers
              .map(x => x.user_id)
              .filter(x => (x !== req.user.id)),
          },
          include: [{
            model: SocketSession,
            attributes: ['id'],
            where: {
              is_online: true,
            },
            required: false,
          }],
        })
        .then(users => res
          .json(users
            .map(x => ({ ...x.toJSON(), online: !!x.SocketSessions.length }))));
    })
    .catch(next);
};
