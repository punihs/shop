const debug = require('debug');

const log = debug('package');

const db = require('../../../conn/sqldb');
const { OBJECT_TYPES: { SHIPMENT } } = require('../../../config/constants');

const { Follower, User, SocketSession } = db;
const attributes = [
  'id', 'email', 'first_name', 'last_name', 'salutation', 'profile_photo_url', 'name',
];

exports.index = async (req, res, next) => {
  try {
    log('index', req.query);

    const followers = await Follower
      .findAll({ where: { object_id: req.params.packageId } });

    if (!followers.length) return res.json([]);

    const users = await User
      .findAll({
        attributes,
        where: {
          id: followers
            .map(x => x.user_id)
            .filter(x => (x !== req.user.id)),
          object_type_id: SHIPMENT,
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
        .map(x => ({ ...x.toJSON(), online: !!x.SocketSessions.length })));
  } catch (err) {
    return next(err);
  }
};
