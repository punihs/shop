const event = require('../../emails/lib/events');

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
      // onesignal: [{
      //   userId: customer.id,
      //   msg: {
      //     title: `Your shipment arrived from ${store}`,
      //   },
      // }],
    });
  res.status(200).end();
};
