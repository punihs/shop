const debug = require('debug');

const event = require('../../emails/lib/events');

const log = debug('s-api-package-notification');

exports.stateChange = async ({
  db: { User, Store }, actingUser, pkg, nextStateId,
}) => {
  const customer = await User
    .findById(pkg.customer_id, {
      attributes: [
        'name', 'salutation', 'first_name', 'last_name', 'email', 'virtual_address_code',
      ],
    });

  log('package notification', { customer });
  return Store
    .findById(pkg.store_id, { raw: true, attributes: ['name'] })
    .then(store => event
      .fire({
        ses: [{
          Source: `"${actingUser.first_name} from Shoppre" <${actingUser.email}>`,
          ReplyToAddresses: ['support@shoppre.com'],
          Destination: {
            ToAddresses: [customer.email],
          },
          Template: 'package_state-change',
          TemplateData: JSON.stringify({
            nextStateId,
            pkg: { ...pkg, Store: store },
            customer: customer.toJSON(),
            actingUser,
          }),
        }, {
          Source: `"${actingUser.first_name} from Shoppre" <${actingUser.email}>`,
          ReplyToAddresses: ['support@shoppre.com'],
          Destination: {
            ToAddresses: [customer.email],
          },
          Template: 'package_state-change',
          TemplateData: JSON.stringify({
            nextStateId,
            pkg: { ...pkg, Store: store },
            customer: customer.toJSON(),
            actingUser,
          }),
        }],
        onesignal: [{
          userId: customer.id,
          msg: {
            title: `Your shipment arrived from ${store}`,
          },
        }],
      }));
};

