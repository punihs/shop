// - Do Not Access SQLDB here
const event = require('../../../../../../silk/chat/server/conn/events');
const { FROM_EMAIL } = require('../../config/environment');

exports.notifications = (req, res) => {
  const {
    customer,
  } = req.body;

  event
    .fire({
      ses: [{
        Source: `"Shoppre.com" <${FROM_EMAIL}>`,
        ReplyToAddresses: ['support@shoppre.com'],
        Destination: {
          ToAddresses: [customer.email],
        },
        Template: 'user_signup_1',
        TemplateData: JSON.stringify({
          customer,
        }),
      }],
    });

  return res.status(200).end();
};
