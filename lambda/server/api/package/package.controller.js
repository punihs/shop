const event = require('../../conn/events');
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
    ORDER_ITEMS,
    packageItems,
  } = req.body;

  const targetUser = {
    MEMBER: 'MEMBER',
    OPS: 'OPS',
  };
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
          subject: subjectMap({ nextStateName, pkg, targetUser, paymentGateway }),
          pkg: { ...pkg },
          customer,
          actingUser,
          ENV,
          INCOMING,
          PERSONAL_SHOPPER,
          paymentGateway,
          ORDER_ITEMS,
          packageItems,
        }),
      }],
      // oneSignal: [{
      //   userId: customer.id,
      //   msg: {
      //     title: `Your shipment arrived from ${pkg.Store.name}`,
      //     body: 'just now',
      //     link: `${PREFIX}member.${DOMAIN}/locker?bucket=IN_REVIEW`,
      //   },
      // }],
      // whatsapp: [{
      //   number: customer.phone,
      //   message: `Your package arrived from ${pkg.Store.name} - ${pkg.id} - \n
      //     ${PREFIX}member.${DOMAIN}/locker?bucket=IN_REVIEW`,
      // }],
    });
  res.status(200).end();
};
