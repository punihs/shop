const debug = require('debug');

const { OBJECT_TYPES: { PACKAGE } } = require('../../../config/constants');

const { Follower, User, SocketSession } = require('../../../conn/sqldb');

const attributes = [
  'id', 'email', 'first_name', 'last_name', 'salutation', 'profile_photo_url', 'name',
];
const log = debug('package');

exports.index = (req, res, next) => {
  log('index', req.query);

  return Follower
    .findAll({
      attributes: ['id', 'object_type_id', 'object_id', 'shared_by', 'updater', 'user_id'],
      where: { object_id: req.params.packageId },
    })
    .then((followers) => {
      if (!followers.length) return res.json([]);

      return User
        .findAll({
          attributes,
          where: {
            id: followers
              .map(x => x.user_id)
              .filter(x => (x !== req.user.id)),
            object_type_id: PACKAGE,
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
            .map(x => ({
              ...x.toJSON(),
              online: !!x.SocketSessions.length,
            }))));
    })
    .catch(next);
};
