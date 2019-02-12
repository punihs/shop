const debug = require('debug');

const { OBJECT_TYPES: { PACKAGE } } = require('../../../config/constants');

const db = require('../../../conn/sqldb');

const {
  Comment, User, PackageState, Follower, Package
} = db;

const log = debug('package');

exports.index = async (req, res, next) => {
  try {

    const data = await db.sequelize.query('Select ' +
      'package_states.package_id as ID, ' +
      'package_states.comments, ' +
      'users.first_name as customerName, ' +
      'actors.first_name as actingUser, ' +
      'package_states.created_at ' +
      'from ' +
      'package_states ' +
      'JOIN packages on packages.id = package_states.package_id ' +
      'join users on users.id = packages.customer_id ' +
      'join users as actors on actors.id = package_states.user_id ' +
      'where ' +
      'package_states.comments is not null ' +
      'union ' +
      'Select ' +
      'comments.object_id as ID, ' +
      'comments.comments, ' +
      'users.first_name as customerName, ' +
      'actors.first_name as actingUser, ' +
      'comments.created_at ' +
      'from ' +
      'comments ' +
      'JOIN packages on packages.id = comments.object_id ' +
      'join users on users.id = packages.customer_id ' +
      'join users as actors on actors.id = comments.user_id ' +
      'where ' +
      'comments.comments is not null ' +
      'and ' +
      'comments.type = 1 ' +
      'order by ' +
      'ID desc ', { type: db.sequelize.QueryTypes.SELECT });

    return res
      .json(data);
  } catch (err) {
    return next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    log('index', req.query);
    const { packageId } = req.params;
    const include = [{
      model: User,
      attributes: [
        'id', 'name', 'salutation', 'first_name', 'last_name', 'profile_photo_url',
        'group_id',
      ],
    }];

    const comments = await Comment
      .findAll({
        attributes: ['id', 'user_id', 'created_at', 'comments'],
        where: {
          object_id: packageId,
          type: PACKAGE,
        },
        include,
      });

    const packageStates = await PackageState.findAll({
      attributes: [
        'id', 'user_id', 'created_at', 'comments', 'state_id',
      ],
      order: [['id', 'DESC']],
      where: {
        package_id: packageId,
      },
      include,
    });

    return res
      .json(comments
        .concat(packageStates));
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    log('index', req.query);

    // - Async
    await Follower
      .findOrCreate({
        where: {
          user_id: req.user.id,
          object_type_id: PACKAGE,
          object_id: req.params.packageId,
        },
        attributes: ['id'],
      });

    const comment = await Comment
      .create({
        ...req.body,
        user_id: req.user.id,
        object_id: req.params.packageId,
        type: PACKAGE,
      });

    return res
      .status(201)
      .json(comment);
  } catch (e) {
    return next(e);
  }
};
