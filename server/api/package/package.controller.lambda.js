const event = require('../../emails/lib/events');
const { PREFIX, DOMAIN } = require('../../config/environment');
const { PACKAGE_STATE_ID_NAMES_MAP } = require('../../config/constants');

exports.notifications = (req, res) => {
  const {
    after: nextStateId,
    actingUser,
    customer,
    pkg,
    ENV,
  } = req.body;

  event
    .fire({
      ses: [{
        Source: `"${actingUser.first_name} from Shoppre" <${actingUser.email}>`,
        ReplyToAddresses: ['support@shoppre.com'],
        Destination: {
          ToAddresses: [customer.email],
        },
        Template: 'package_state-change_2',
        TemplateData: JSON.stringify({
          nextStateId,
          [PACKAGE_STATE_ID_NAMES_MAP[nextStateId]]: true,
          pkg: { ...pkg },
          customer,
          actingUser,
          ENV,
        }),
      }],
    });
  res.status(200).end();
};
