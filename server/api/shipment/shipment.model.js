const moment = require('moment');
const properties = require('./shipment.property');
const debug = require('debug');
const logger = require('../../components/logger');
const notification = require('./shipment.notification');

const log = debug('s.api.shipment.controller');
const {
  LOYALTY_TYPE: { REWARD },
  TRANSACTION_TYPES: { CREDIT },
  SHIPMENT_STATE_IDS: {
    INQUEUE, INREVIEW, DISPATCHED, DELIVERED, CANCELED, SHIPMENT_CANCELLED,
    INTRANSIT, CUSTOM_HOLD, LOST, DAMAGED, WRONG_DELIVERY, PAYMENT_CONFIRMED, SHIPMENT_HANDED,
  },
} = require('../../config/constants');

const stateIdcommentMap = {
  [INQUEUE]: 'shipment under queue after payment',
  [INREVIEW]: 'shipment under review by shoppre',
  [CANCELED]: 'Shipment is cancelled',
  [DISPATCHED]: 'Shipment is dispatched',
  [INTRANSIT]: 'intransit',
  [CUSTOM_HOLD]: 'custom_hold',
  [LOST]: 'lost',
  [DELIVERED]: 'Shipment is delivered',
  [DAMAGED]: 'damaged',
  [WRONG_DELIVERY]: 'wrong_delivery',
  [PAYMENT_CONFIRMED]: 'payment confirmed',
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

    Shipment.belongsTo(db.ShipmentType, {
      foreignKey: 'shipment_type_id',
    });

    Shipment.belongsTo(db.PaymentGateway);
    Shipment.belongsTo(db.Place, {
      foreignKey: 'destination_city_id',
    });
    Shipment.belongsTo(db.Address, {
      foreignKey: 'address_id',
    });
    Shipment.hasMany(db.Package);
    Shipment.hasOne(db.ShipmentMeta);
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
    Shipment.belongsTo(db.ShippingPartner);
    Shipment.belongsTo(db.ShipmentType);
    Shipment.hasOne(db.ShipmentMeta);
    db.Country.hasMany(Shipment);
  };

  Shipment.updateShipmentState = async ({
    db,
    nextStateId,
    shipment,
    actingUser,
    comments = null,
  }) => {
    log('updateShipmentState', nextStateId);
    log('shp', shipment);
    const options = {
      shipment_id: shipment.id,
      user_id: actingUser.id,
      state_id: nextStateId,
    };
    log({ options });
    if (stateIdcommentMap[nextStateId]) options.comments = stateIdcommentMap[nextStateId];
    if (comments) options.comments = comments || stateIdcommentMap[nextStateId];


    const shipmentState = await db.ShipmentState
      .create(options);
    switch (nextStateId) {
      case PAYMENT_CONFIRMED: {
        const optionsLoyalty = {
          attributes: ['id', 'total_points', 'points', 'level'],
          where: { customer_Id: shipment.customer_id },
        };
        const loyaltyId = await db.LoyaltyPoint
          .find(optionsLoyalty);
        log('loyaltyId', loyaltyId);
        const loyalty = {};
        let points = {};
        log('level', loyaltyId.level);
        if (loyaltyId.shipment_id !== 1) {
          if (loyaltyId.level === 1) {
            points = ((5 / 100) * shipment.final_amount);
          } else if (loyaltyId.level === 2) {
            points = ((8 / 100) * shipment.final_amount);
          } else if (loyaltyId.level === 3) {
            points = ((10 / 100) * shipment.final_amount);
          } else if (loyaltyId.level === 4) {
            points = ((12 / 100) * shipment.final_amount);
          }
          log('final amount', shipment.final_amount);
          log('level', loyaltyId.level);
          loyalty.points = loyaltyId.points + points;
          loyalty.total_points = loyaltyId.points + points;

          if (loyaltyId.total_points < 1000) {
            loyaltyId.level = 1;
          } else if (loyaltyId.total_points >= 1000 && loyaltyId.total_points < 6000) {
            loyalty.level = 2;
          } else if (loyaltyId.total >= 6000 && loyaltyId.total < 26000) {
            loyalty.level = 3;
          } else if (loyaltyId.total >= 26000) {
            loyalty.level = 4;
          }
          loyalty.shipment_id = shipment.id;
          log({ loyalty });
          await db.LoyaltyPoint.update(loyalty, { where: { id: loyaltyId.id } });

          const misclenious = {};
          misclenious.customer_id = shipment.customer_id;
          misclenious.description = 'Shipping Reward';
          misclenious.points = points;
          misclenious.type = REWARD;
          await db.LoyaltyHistory.create(misclenious);
        }
        if (!shipment.tracking) {
          const tracking = {};
          tracking.dispatch_date = moment();
          tracking.number_of_packages = shipment.packages_count;
          tracking.weight_by_shipping_partner = shipment.weight;
          tracking.value_by_shipping_partner = shipment.value_amount;
          await db.Shipment.update(tracking, { where: { id: shipment.id } });
        }

        shipment.getPackages()
          .then(packageItems => notification
            .stateChange({
              db,
              nextStateId,
              shipment,
              actingUser,
              packageItems,
            }))
          .catch(err => logger.error('statechange notification', nextStateId, shipment, err));

        break;
      }
      case SHIPMENT_HANDED: {
        log('state changed - shipment handed to partner', SHIPMENT_HANDED);
        if (shipment.tracking_code) {
          // - Todo:  add this code before creating state
          // const tracking = shipment.tracking_code;
          // if (!shipment.dispatch_date || !shipment.shipping_carrier
          // || !shipment.number_of_packages ||
          //   !shipment.weight_by_shipping_partner ||
          //   !shipment.value_by_shipping_partner || !shipment.tracking_code) {
          //   return res.json({ error:
          // 'You must update Shipment Tracking Information to send dispatch notification!' });
          // }
          // $shpmnt->shipping_status = 'dispatched';

          const couponAppliedStatus = await db.Redemption
            .update({ status: 'success' }, { where: { shipment_order_code: shipment.order_code } });

          let promo = '';
          if (couponAppliedStatus) {
            promo = await db.Coupon
              .find(
                { attributes: ['id', 'cashback_percentage', 'max_cashback_amount'] },
                { where: { code: couponAppliedStatus.coupon_code } },
              );

            if (promo) {
              // const optionCashBack = {
              //   attributes: ['wallet_balance_amount'],
              //   where: { id: actingUser.id },
              // }
              if (promo.cashback_percentage) {
                // await db.User(optionCashBack)
                //   .then(total_wallet_amount => {
                const cashbackAmount =
                    shipment.estimated_amount * (promo.cashback_percentage / 100);
                const maxCouponAmount = promo.max_cashback_amount || 0;
                let totalCashbackAmount = 0;
                if (cashbackAmount <= maxCouponAmount) {
                  totalCashbackAmount = cashbackAmount;
                } else {
                  totalCashbackAmount = maxCouponAmount;
                }
                const transaction = {};
                transaction.customer_id = actingUser.customer_id;
                transaction.amount = totalCashbackAmount;
                transaction.type = CREDIT;
                transaction.description = `Wallet transactions for coupon code | Shipment ID  ${shipment.order_code}`;
                // });
              }
            }
            // }
            // if(!in_array('ship_dispatched', $shipmails)){
            //   $this->mailerShipping($shipRqst->id, 'ship_dispatched');
          }
        } else {
        // return redirect()->back()->with('error',
          // 'You must update Shipment Tracking Information to send dispatch notification!');
        }


        break;
      }
      case SHIPMENT_CANCELLED: {
        log('state changed CANCELLED', SHIPMENT_CANCELLED);

        await db.PackageState
          .then((packageState) => {
            db.Package.update({
              shipment_state_id: packageState.id,
            }, {
              where: { shipment_id: shipment.id },
            });
          });
        // Mail::to($customer->email)->send(new ShipmentCancelled($packages, $shipRqst));
        break;
      }
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
        shipment.getPackages()
          .then(packages => notification
            .stateChange({
              db,
              nextStateId,
              shipment,
              actingUser,
              packages,
            }))
          .catch(err => logger.error('statechange notification', nextStateId, shipment, err));
        break;
      }
      default: {
        log('state changed default');
      }
    }
    log('shipmentState', shipmentState.id);
    return db.Shipment
      .update({
        shipment_state_id: shipmentState.id,
      }, {
        where: { id: shipment.id },
      });
  };
  return Shipment;
};

