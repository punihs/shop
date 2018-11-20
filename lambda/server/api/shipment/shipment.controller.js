const debug = require('debug');
const ses = require('../../../../engage/server/conn/email/ses');
const subjectMap = require('../shipment/emails/state-change/subject');

const log = debug('s-api-shipment-notification');

exports.notification = async (req, res, next) => {
  try {
    const {
      nextStateId,
      shipment,
      address,
      nextStateName,
      packages,
      customer,
      actingUser,
      paymentGateway,
      ENV,
    } = req.body;
    const TemplateData = JSON.stringify({
      nextStateId,
      nextStateName,
      [nextStateName]: true,
      shipment,
      address,
      subject: subjectMap({ nextStateName, shipment, paymentGateway }),
      packages,
      customer,
      actingUser,
      paymentGateway,
      ENV,
    });

    console.log('---------------\n\n');
    console.log(TemplateData);
    console.log('\n\n---------------');

    // console.log('Shipment Notification', shipment);

    ses.sendTemplatedEmailAsync({
      Source: `"${actingUser.first_name} from Shoppre" <${actingUser.email}>`,
      ReplyToAddresses: ['support@shoppre.com'],
      Destination: {
        ToAddresses: [customer.email],
      },
      Template: 'shipment_state-change_2',
      TemplateData,
    });
  } catch (e) {
    next(e);
  }
};
