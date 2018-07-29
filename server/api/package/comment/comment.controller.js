
const debug = require('debug');

const log = debug('package');

const logger = require('../../../components/logger');
const db = require('../../../conn/sqldb');
const { OBJECT_TYPES: { PACKAGE } } = require('../../../config/constants');

const {
  Comment, User, PackageState, Follower,
} = db;

exports.index = (req, res, next) => {
  log('index', req.query);
  const { packageId } = req.params;
  const include = [{
    model: User,
    attributes: ['id', 'name', 'salutation', 'first_name', 'last_name', 'profile_photo_url', 'group_id'],
  }];

  return Promise
    .all([
      Comment
        .findAll({
          attributes: ['id', 'user_id', 'created_at', 'comments'],
          where: {
            object_id: packageId,
            type: PACKAGE,
          },
          include,
        }),
      PackageState.findAll({
        attributes: [
          'id', 'user_id', 'created_at', 'comments', 'state_id',
        ],
        order: [['id', 'DESC']],
        where: {
          package_id: packageId,
        },
        include,
      }),
    ])
    .then(([comments, packageStates]) => res.json(comments.concat(packageStates)))
    .catch(next);
};

exports.create = (req, res, next) => {
  log('index', req.query);
  Follower
    .findOrCreate({
      where: {
        user_id: req.user.id,
        object_type_id: PACKAGE,
        object_id: req.params.packageId,
      },
      attributes: ['id'],
      raw: true,
    })
    .catch(err => logger.error('comment follower creation error', err));

  return Comment
    .create({
      ...req.body,
      user_id: req.user.id,
      object_id: req.params.packageId,
      type: PACKAGE,
    })
    .then(comments => res.status(201).json(comments))
    .catch(next);
};
