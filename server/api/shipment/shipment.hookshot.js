const debug = require('debug');
const hookshot = require('../../conn/hookshot');

const log = debug('s-api-shipment-notification');
const { User } = require('../../conn/sqldb');

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
    shipment: { ...shipment },
    packages,
    customer,
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
