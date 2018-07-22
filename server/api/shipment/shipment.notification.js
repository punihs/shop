const debug = require('debug');
const ses = require('../../conn/email/ses');

const log = debug('s-api-shipment-notification');

exports.stateChange = async ({
  db: { User }, actingUser, shpmnt, nextStateId,
}) => {
  const customer = await User
    .findById(shpmnt.customer_id, {
      attributes: [
        'name', 'salutation', 'first_name', 'last_name', 'email', 'virtual_address_code',
      ],
    });

  log({ customer });
  return ses.sendTemplatedEmailAsync({
    Source: `"${actingUser.first_name} from Shoppre" <${actingUser.email}>`,
    ReplyToAddresses: ['support@shoppre.com'],
    Destination: {
      ToAddresses: [customer.email],
    },
    Template: 'shipment_state-change',
    TemplateData: JSON.stringify({
      nextStateId,
      pkg: { ...shpmnt.toJSON() },
      customer: customer.toJSON(),
      actingUser,
    }),
  });
};
