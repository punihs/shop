
const {
  User, Notification,
} = require('../../conn/sqldb');
const ses = require('../../conn/email/ses');
const logger = require('../../components/logger');
const eventEmitter = require('../../conn/event');

const sendEmail = async ({
  userId, packages, address, updateShip,
}) => {
  const user = await User.findById(userId);
  return ses.sendTemplatedEmail({
    Source: 'support@shoppre.com',
    Destination: {
      ToAddresses: [user.email],
    },
    Template: 'shoppre',
    TemplateData: JSON.stringify({
      packages,
      address,
      ship_request: updateShip,
    }),
  }, (err, data) => {
    if (err) {
      logger.log('SES err', err);
      return err;
    }
    return logger.log('send', data);
  });
};

const sendNotification = ({ userId, sR }) => {
  const notification = {};
  notification.customer_id = userId;
  notification.action_type = 'shipment';
  notification.action_id = sR.id;
  notification.action_description = `New shipment request created - Order# ${sR.order_id}`;
  return Notification.create(notification);
};

eventEmitter.on('shipment:create', sendNotification);
eventEmitter.on('shipment:create', sendEmail);
