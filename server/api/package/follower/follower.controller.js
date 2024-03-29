const debug = require('debug');

const { Follower, User, SocketSession } = require('../../../conn/sqldb');

const attributes = [
  'id', 'email', 'first_name', 'last_name', 'salutation', 'profile_photo_url', 'name',
];
const log = debug('package');

exports.index = async (req, res, next) => {
  try {
    log('index', req.query);

    const followers = await Follower
      .findAll({
        attributes: ['id', 'object_type_id', 'object_id', 'shared_by', 'updated_by', 'user_id'],
        where: { object_id: req.params.packageId },
      });

    if (!followers.length) return res.json([]);

    const users = await User
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
      });

    return res
      .json(users
        .map(x => ({
          ...x.toJSON(),
          online: !!x.SocketSessions.length,
        })));
  } catch (err) {
    return next(err);
  }
};
