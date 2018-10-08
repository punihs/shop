const event = require('../../emails/lib/events');
const { PREFIX, DOMAIN } = require('../../config/environment');

exports.notifications = (req, res) => {
  const {
    nextStateId,
    actingUser,
    customer,
    pkg,
  } = req.body;

  event
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
          pkg: { ...pkg },
          customer,
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
          pkg,
          customer,
          actingUser,
        }),
      }],
      oneSignal: [{
        userId: customer.id,
        msg: {
          title: `Your shipment arrived from ${pkg.Store.name}`,
        },
        target: {
          url: `${PREFIX}member.${DOMAIN}/locker?bucket=IN_REVIEW`,
        },
      }],
    });
  res.status(200).end();
};
