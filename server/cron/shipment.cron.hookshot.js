const debug = require('debug');
const hookshot = require('../conn/hookshot');
const viewConfig = require('../view.config');

const log = debug('s-api-shipment-notification');

const { User } = require('../conn/sqldb');

const { SHIPMENT_STATE_ID_NAMES_MAP } = require('../config/constants');

const toJSON = object => (object.toJSON ? object.toJSON() : object);

exports.stateChange = async ({
  actingUser, shipment, packages, nextStateId, address, paymentGateway,
  gateway, paymentDelayCharge, paymentDelayLimit,
}) => {
  log('statechange');
  try {
    const customer = await User
      .findById(shipment.customer_id, {
        attributes: [
          'name', 'salutation', 'first_name', 'last_name', 'email', 'virtual_address_code',
        ],
      });

    return hookshot.trigger('shipment:stateChange', {
      before: null,
      nextStateId,
      nextStateName: SHIPMENT_STATE_ID_NAMES_MAP[nextStateId],
      shipment,
      paymentGateway,
      packages,
      customer: toJSON(customer),
      actingUser,
      ENV: viewConfig,
      address,
      [gateway]: true,
      paymentDelayCharge,
      paymentDelayLimit,
    });
  } catch (err) {
    return err;
  }
};

exports.create = ({
  actingUser, shipment, packages, address, next,
}) => {
  try {
    return hookshot.trigger('shipment:create', {
      actingUser,
      shipment,
      packages,
      address,
    });
  } catch (err) {
    return next(err);
  }
};
