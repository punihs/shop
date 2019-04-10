const debug = require('debug');
const ses = require('../../../../engage/server/conn/email/ses');
const subjectMap = require('../shipment/emails/state-change/subject');
const event = require('../../conn/events');

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
      paymentDelayCharge,
      paymentDelayLimit,
      otp,
      comments,
      aipexPartner,
    } = req.body;

    const { URLS_PARCEL } = ENV;
    customer.first_name = customer.first_name.charAt(0).toUpperCase() +
      customer.first_name.slice(1);

    event
      .fire({
        ses: [{
          Source: `"${actingUser.first_name} from Shoppre" <${actingUser.email}>`,
          ReplyToAddresses: ['support@shoppre.com'],
          Destination: {
            ToAddresses: [customer.email],
          },
          Template: 'shipment_state-change_2',
          TemplateData: JSON.stringify({
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
            paymentDelayCharge,
            paymentDelayLimit,
            otp,
            aipexPartner,
          }),
        }],
        oneSignal: [{
          userId: customer.id,
          msg: {
            title: comments,
            body: 'Click here to see details',
            link: `${URLS_PARCEL}/shipRequests`,
          },
        }],
      });
  } catch (e) {
    next(e);
  }
};
