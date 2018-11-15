const debug = require('debug');
const ses = require('../../../../engage/server/conn/email/ses');
const subjectMap = require('../shipment/emails/state-change/subject');

const log = debug('s-api-shipment-notification');

exports.notification = async (req, res, next) => {
  try {
    const {
      nextStateId,
      shipmentDetails,
      shipToAddress,
      nextStateName,
      pkg,
      customer,
      actingUser,
      ENV,
    } = req.body;
    console.log('Shipment Notification', shipmentDetails);

    ses.sendTemplatedEmailAsync({
      Source: `"${actingUser.first_name} from Shoppre" <${actingUser.email}>`,
      ReplyToAddresses: ['support@shoppre.com'],
      Destination: {
        ToAddresses: [customer.email],
      },
      Template: 'shipment_state-change_2',
      TemplateData: JSON.stringify({
        nextStateId,
        [nextStateName]: true,
        shipmentDetails,
        shipToAddress,
        subject: subjectMap({ nextStateName, shipmentDetails }),
        pkg: { ...pkg },
        customer,
        actingUser,
        ENV,
      }),
    });
  } catch (e) {
    next(e);
  }
};
