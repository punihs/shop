const debug = require('debug');
const ses = require('../../conn/email/ses');

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

  log({ customer });
  const store = await Store
    .findById(pkg.store_id, { raw: true, attributes: ['name'] });

  return ses.sendTemplatedEmailAsync({
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
  });
};
