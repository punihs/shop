const debug = require('debug');

const log = debug('shipment');

const logger = require('../../../components/logger');
const db = require('../../../conn/sqldb');
const { OBJECT_TYPES: { SHIPMENT } } = require('../../../config/constants');

const {
  Comment, User, ShipmentState, Follower,
} = db;

exports.index = async (req, res, next) => {
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

    return res.json(comments.concat(shipmentStates));
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
