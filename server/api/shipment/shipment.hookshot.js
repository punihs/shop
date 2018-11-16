const debug = require('debug');
const hookshot = require('../../conn/hookshot');

const log = debug('s-api-shipment-notification');
const { User } = require('../../conn/sqldb');

const map = {
  16: 'PAYMENT_REQUESTED',
};
exports.stateChange = async ({
  actingUser, shipment, packages, nextStateId, ENV, address,
}) => {
  const customer = await User
    .findById(shipment.customer_id, {
      attributes: [
        'name', 'salutation', 'first_name', 'last_name', 'email', 'virtual_address_code',
      ],
    });

  log({ customer });
  return hookshot.trigger('shipment:stateChange', {
    before: null,
    nextStateId,
    nextStateName: map[nextStateId],
    shipment: { ...shipment },
    packages,
    customer: customer.toJSON(),
    actingUser,
    ENV,
    subject: '',
    address,
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
