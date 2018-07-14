const properties = require('./shipment.property');
const debug = require('debug');
const logger = require('../../components/logger');
const notification = require('./shipment.notification');

const log = debug('s.api.shipment.controller');
const {
  SHIPMENT_STATE_IDS: {
    INQUEUE, INREVIEW, DISPATCHED, DELIVERED, CANCELED,
    CONFIRMATION, INTRANSIT, CUSTOM_HOLD, LOST, DAMAGED, WRONG_DELIVERY,
  },
} = require('../../config/constants');

const stateIdcommentMap = {
  [INQUEUE]: 'shipment under queue after payment',
  [INREVIEW]: 'shipment under review by shoppre',
  [CANCELED]: 'Shipment is cancelled',
  [CONFIRMATION]: 'shipment payment done',
  [DISPATCHED]: 'Shipment is dispatched',
  [INTRANSIT]: 'intransit',
  [CUSTOM_HOLD]: 'custom_hold',
  [LOST]: 'lost',
  [DELIVERED]: 'Shipment is delivered',
  [DAMAGED]: 'damaged',
  [WRONG_DELIVERY]: 'wrong_delivery',
};

module.exports = (sequelize, DataTypes) => {
  const Shipment = sequelize.define('Shipment', properties(DataTypes), {
    tableName: 'shipments',
    timestamps: true,
    underscored: true,
    paranoid: true,
  });

  Shipment.associate = (db) => {
    Shipment.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });

    Shipment.belongsTo(db.User, {
      foreignKey: 'created_by',
      as: 'Creator',
    });

    Shipment.belongsTo(db.PaymentGateway);
    Shipment.belongsTo(db.Place, {
      foreignKey: 'destination_city_id',
    });
    db.Place.hasMany(Shipment, {
      foreignKey: 'destination_city_id',
    });

    Shipment.belongsTo(db.ShipmentState, {
      defaultScope: {
        where: { status: 1 },
      },
      foreignKey: 'shipment_state_id',
    });

    Shipment.belongsTo(db.Country);
    Shipment.belongsTo(db.ShipmentType);
    Shipment.hasMany(db.ShipmentIssue);
    db.Country.hasMany(Shipment);
  };

  Shipment.updateShipmentState = ({
    db,
    nextStateId,
    shpmnt,
    actingUser,
    comments = null,
  }) => {
    log('updateShipmentState', nextStateId);
    log('shp', shpmnt);
    const options = {
      shipment_id: shpmnt.id,
      user_id: actingUser.id,
      state_id: nextStateId,
    };

    if (stateIdcommentMap[nextStateId]) options.comments = stateIdcommentMap[nextStateId];
    if (comments) options.comments = comments || stateIdcommentMap[nextStateId];

    return db.ShipmentState
      .create(options)
      .then((shipmentState) => {
        switch (nextStateId) {
          case INREVIEW: {
            log('state changed', INREVIEW);
            // const photoRequest = await PhotoRequest.find({
            //   attributes: ['id'],
            //   where: {
            //     package_id: id,
            //   },
            // });
            //
            // if (photoRequest.status === 'pending') {
            //   return res.status(400)
            // res.json({ message: 'Please check and update the Photo Request Status !' });
            // }

            // - Todo: check number of items validation
            // else if (itemCount !== pack.number_of_items) {
            //   return res.status(400).res.json({ message: 'please check your items !' });
            // }
            break;
          }
          case INQUEUE: {
            shpmnt.getPackageItems()
              .then(packageItems => notification
                .stateChange({
                  db,
                  nextStateId,
                  shpmnt,
                  actingUser,
                  packageItems,
                }))
              .catch(err => logger.error('statechange notification', nextStateId, shpmnt, err));
            break;
          }
          default: {
            log('state changed default');
          }
        }

        return db.Shipment
          .update({
            shipment_state_id: shipmentState.id,
          }, {
            where: { id: shpmnt.id },
          });
      });
  };
  return Shipment;
};

