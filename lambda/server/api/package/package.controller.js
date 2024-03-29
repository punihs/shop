const event = require('../../../../../../silk/chat/server/conn/events');
const subjectMap = require('../package/emails/state-change/subject');
// const { PREFIX, DOMAIN } = require('../../config/environment');

exports.notifications = (req, res) => {
  const {
    after: nextStateId,
    nextStateName,
    actingUser,
    customer,
    pkg,
    ENV,
    paymentGateway,
    INCOMING,
    PERSONAL_SHOPPER,
    COD,
    ORDER_ITEMS,
    packageStorageLimit,
    packageStorageExceededCharge,
    otp,
    comments,
  } = req.body;

  const targetUser = {
    MEMBER: 'MEMBER',
    OPS: 'OPS',
  };
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
        Template: 'package_state-change_2',
        TemplateData: JSON.stringify({
          nextStateId,
          [nextStateName]: true,
          subject: subjectMap({
            nextStateName, pkg, targetUser, paymentGateway,
          }),
          pkg: { ...pkg },
          customer,
          actingUser,
          ENV,
          INCOMING,
          PERSONAL_SHOPPER,
          COD,
          paymentGateway,
          ORDER_ITEMS,
          packageStorageLimit,
          packageStorageExceededCharge,
          otp,
        }),
      }],
      oneSignal: [{
        userId: customer.id,
        msg: {
          title: comments,
          body: 'Click here to see details',
          link: `${URLS_PARCEL}/packages?bucket=READY_TO_SEND`,
        },
      }],
      // whatsapp: [{
      //   number: customer.phone,
      //   message: `Your package arrived from ${pkg.Store.name} - ${pkg.id} - \n
      //     ${PREFIX}member.${DOMAIN}/locker?bucket=IN_REVIEW`,
      // }],
    });
  res.status(200).end();
};
