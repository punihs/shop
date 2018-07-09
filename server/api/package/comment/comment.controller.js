
const debug = require('debug');

const log = debug('package');

const logger = require('../../../components/logger');
const db = require('../../../conn/sqldb');
const { FOLLOWER_TYPES: { PACKAGE } } = require('../../../config/constants');

const {
  PackageComment, User, PackageState, Follower,
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
      PackageComment
        .findAll({
          attributes: ['id', 'user_id', 'created_at', 'comments'],
          where: {
            package_id: packageId,
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
    .then(([packageComments, packageStates]) => res.json(packageComments.concat(packageStates)))
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

  return PackageComment
    .create({
      ...req.body,
      user_id: req.user.id,
      package_id: req.params.packageId,
    })
    .then(packageComments => res.status(201).json(packageComments))
    .catch(next);
};
