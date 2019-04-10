const debug = require('debug');
const jwt = require('jsonwebtoken');
const hookshot = require('../../conn/hookshot');
const viewConfig = require('../../view.config');

const log = debug('s-api-shipment-notification');
const env = require('../../config/environment');
const { User } = require('../../conn/sqldb');

const { SHIPMENT_STATE_ID_NAMES_MAP } = require('../../config/constants');

const toJSON = object => (object.toJSON ? object.toJSON() : object);

exports.stateChange = async ({
  actingUser, shipment, packages, nextStateId,
  address, paymentGateway, gateway, next, comments, aipexPartner,
}) => {
  try {
    const customer = await User
      .findById(shipment.customer_id, {
        attributes: [
          'id', 'name', 'salutation', 'first_name', 'last_name', 'email', 'virtual_address_code',
        ],
      });

    const otp = jwt.sign({ email: customer.email }, env.MASTER_TOKEN);

    log({ paymentGateway });

    return hookshot.trigger('shipment:stateChange', {
      before: null,
      nextStateId,
      nextStateName: SHIPMENT_STATE_ID_NAMES_MAP[nextStateId],
      shipment: { ...toJSON(shipment) },
      paymentGateway,
      packages,
      customer: toJSON(customer),
      actingUser,
      ENV: viewConfig,
      address,
      [gateway]: true,
      otp,
      comments,
      aipexPartner,
    });
  } catch (err) {
    return next(err);
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
