
const debug = require('debug');

const log = debug('package');

const db = require('../../../conn/sqldb');

const {
  PackageComment, User, PackageState,
} = db;


exports.index = (req, res, next) => {
  log('index', req.query);
  const { packageId } = req.params;
  const include = [{
    model: User,
    attributes: ['id', 'name', 'salutation', 'first_name', 'last_name', 'profile_photo_url'],
  }];

  return Promise
    .all([
      PackageComment
        .findAll({
          attributes: ['id', 'user_id', 'comments'],
          where: {
            package_id: packageId,
          },
          include,
        }),
      PackageState.findAll({
        attributes: [
          'id', 'state_id', 'user_id', 'created_at', 'comments',
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
  return PackageComment
    .create({
      ...req.body,
      user_id: req.user.id,
    })
    .then(packageComments => res.status(201).json(packageComments))
    .catch(next);
};
