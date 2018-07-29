
const debug = require('debug');

const log = debug('shipment');

const logger = require('../../../components/logger');
const db = require('../../../conn/sqldb');
const { OBJECT_TYPES: { SHIPMENT } } = require('../../../config/constants');

const {
  Comment, User, ShipmentState, Follower,
} = db;

exports.index = (req, res, next) => {
  log('index', req.query);
  const { shipmentId } = req.params;
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
            object_id: shipmentId,
            type: SHIPMENT,
          },
          include,
        }),
      ShipmentState.findAll({
        attributes: [
          'id', 'user_id', 'created_at', 'comments', 'state_id',
        ],
        order: [['id', 'DESC']],
        where: {
          shipment_id: shipmentId,
        },
        include,
      }),
    ])
    .then(([comments, shipmentStates]) => res.json(comments.concat(shipmentStates)))
    .catch(next);
};

exports.create = (req, res, next) => {
  log('index', req.query);
  Follower
    .findOrCreate({
      where: {
        user_id: req.user.id,
        object_type_id: SHIPMENT,
        object_id: req.params.shipmentId,
      },
      attributes: ['id'],
      raw: true,
    })
    .catch(err => logger.error('comment follower creation error', err));

  return Comment
    .create({
      ...req.body,
      user_id: req.user.id,
      object_id: req.params.shipmentId,
      type: SHIPMENT,
    })
    .then(comments => res.status(201).json(comments))
    .catch(next);
};
