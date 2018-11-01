const debug = require('debug');
const ses = require('../../conn/email/ses');

const log = debug('s-api-shipment-notification');

exports.stateChange = async (req, res, next) => {
  log('statechange');
  try {
    const {
      nextStateId,
      shipment,
      packages,
      customer,
      actingUser,
    } = req.body;

    ses.sendTemplatedEmailAsync({
      Source: `"${actingUser.first_name} from Shoppre" <${actingUser.email}>`,
      ReplyToAddresses: ['support@shoppre.com'],
      Destination: {
        ToAddresses: [customer.email],
      },
      Template: 'shipment_state-change',
      TemplateData: JSON.stringify({
        nextStateId,
        shipment,
        packages,
        customer,
        actingUser,
      }),
    });
  } catch (e) {
    next(e);
  }
};
