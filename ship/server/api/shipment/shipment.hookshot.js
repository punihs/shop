const debug = require('debug');
const hookshot = require('./shipment.hookshot');

const log = debug('s-api-shipment-notification');

exports.stateChange = async ({
  db: { User }, actingUser, shipment, packages, nextStateId,
}) => {
  const customer = await User
    .findById(shipment.customer_id, {
      attributes: [
        'name', 'salutation', 'first_name', 'last_name', 'email', 'virtual_address_code',
      ],
    });

  log({ customer });
  return hookshot.trigger('shipment:state-change', {
    nextStateId,
    shipment: { ...shipment.toJSON() },
    packages,
    customer: customer.toJSON(),
    actingUser,
  });
};
