const ses = require('../../conn/ses');

exports.stateChange = async ({
  db: { User, Store }, actingUser, pkg, nextStateId,
}) => {
  const customer = await User
    .findById(pkg.customer_id, { raw: true, attributes: ['first_name', 'email'] });

  const store = await Store
    .findById(pkg.store_id, { raw: true, attributes: ['name'] });

  return ses.sendTemplatedEmailAsync({
    Source: `"${actingUser.firstname} from Shoppre" <support@shoppre.com>`,
    Destination: {
      ToAddresses: [customer.email],
    },
    Template: 'package-state-change',
    TemplateData: JSON.stringify({
      nextStateId,
      pkg: { ...pkg, Store: store },
      customer,
    }),
  });
};
