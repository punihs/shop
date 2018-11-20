const debug = require('debug');
const hookshot = require('../../conn/hookshot');
const viewConfig = require('../../view.config');

const log = debug('s-api-shipment-notification');
const { User } = require('../../conn/sqldb');

// const map = {
//   18: 'PAYMENT_REQUESTED',
// };

const { SHIPMENT_STATE_ID_NAMES_MAP } = require('../../config/constants');

exports.stateChange = async ({
  actingUser, shipment, packages, nextStateId, address, paymentGateway, gateway,
}) => {
  const customer = await User
    .findById(shipment.customer_id, {
      attributes: [
        'name', 'salutation', 'first_name', 'last_name', 'email', 'virtual_address_code',
      ],
    });

  log({ paymentGateway });
  return hookshot.trigger('shipment:stateChange', {
    before: null,
    nextStateId,
    nextStateName: SHIPMENT_STATE_ID_NAMES_MAP[nextStateId],
    shipment: { ...shipment },
    paymentGateway,
    packages,
    customer: customer.toJSON(),
    actingUser,
    ENV: viewConfig,
    address,
    [gateway]: true,
  });
};

exports.create = ({
  actingUser, shipment, packages, address,
}) => {
  hookshot.trigger('shipment:create', {
    actingUser,
    shipment,
    packages,
    address,
  });
};
