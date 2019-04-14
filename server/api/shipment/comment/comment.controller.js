const debug = require('debug');
const _ = require('lodash');

const log = debug('shipment');

const db = require('../../../conn/sqldb');
const { OBJECT_TYPES: { SHIPMENT } } = require('../../../config/constants');

const {
  Comment, User, ShipmentState, Follower,
} = db;

exports.index = async (req, res, next) => {
  try {
    const data = await db.sequelize.query('Select ' +
      'shipment_states.shipment_id as ID, ' +
      'shipment_states.comments, ' +
      'users.first_name as customerName, ' +
      'actors.first_name as actingUser, ' +
      'shipment_states.created_at ' +
      'from ' +
      'shipment_states ' +
      'JOIN shipments on shipments.id = shipment_states.shipment_id ' +
      'join users on users.id = shipments.customer_id ' +
      'join users as actors on actors.id = shipment_states.user_id ' +
      'where ' +
      'shipment_states.comments is not null ' +
      'union ' +
      'Select ' +
      'comments.object_id as ID, ' +
      'comments.comments, ' +
      'users.first_name as customerName, ' +
      'actors.first_name as actingUser, ' +
      'comments.created_at ' +
      'from ' +
      'comments ' +
      'JOIN shipments on shipments.id = comments.object_id ' +
      'join users on users.id = shipments.customer_id ' +
      'join users as actors on actors.id = comments.user_id ' +
      'where ' +
      'comments.comments is not null ' +
      'and ' +
      'comments.type = 2 ' +
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
    const { shipmentId } = req.params;
    const include = [{
      model: User,
      attributes: ['id', 'name', 'salutation', 'first_name', 'last_name', 'profile_photo_url', 'group_id'],
    }];

    const comments = await Comment
      .findAll({
        attributes: ['id', 'user_id', 'created_at', 'comments'],
        where: {
          object_id: shipmentId,
          type: SHIPMENT,
        },
        include,
      });
    const shipmentStates = await ShipmentState.findAll({
      attributes: [
        'id', 'user_id', 'created_at', 'comments', 'state_id',
      ],
      order: [['id', 'DESC']],
      where: {
        shipment_id: shipmentId,
      },
      include,
    });

    const allComments = comments.concat(shipmentStates);
    const shortedComments = _.orderBy(allComments, ['created_at'], ['desc']);

    return res.json(shortedComments);
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    log('index', req.query);

    await Follower
      .findOrCreate({
        where: {
          user_id: req.user.id,
          object_type_id: SHIPMENT,
          object_id: req.params.shipmentId,
        },
        attributes: ['id'],
        raw: true,
      });

    const comments = await Comment
      .create({
        ...req.body,
        user_id: req.user.id,
        object_id: req.params.shipmentId,
        type: SHIPMENT,
      });

    return res.status(201).json(comments);
  } catch (err) {
    return next(err);
  }
};
