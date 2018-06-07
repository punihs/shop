const {
  Package, Notification,
} = require('../../../conn/sqldb');

exports.return = async (req, res) => {
  const { returnPackid } = req.body;
  const customerId = req.user.id;
  let returnMsg = '';
  const options = {
    where: { customer_id: customerId, id: returnPackid },
  };
  const packages = await Package
    .find(options);
  if (packages) {
    if (req.body.return_type === 'return_pickup') {
      returnMsg = 'return_pickup,'.concat(req.body.message1);
    } else {
      returnMsg = 'return_shoppre,'.concat(req.body.message2);
    }
    // sending mail is pending here
    await Package.update(
      { status: 'return', review: 'Return to sender requested', return_send: returnMsg },
      { where: { id: returnPackid } },
    );
    const notification = {};
    notification.customer_id = customerId;
    notification.action_type = 'package';
    notification.action_id = returnPackid;
    notification.action_description = 'Return to sender requested - Order#'.concat(returnPackid);
    await Notification.create(notification)
      .then(() => res.status(201).json({ message: 'package updated' }));
  }
  res.status(201).json({ message: 'package not found' });
};

exports.split = async (req, res) => {
  const { splitPackid } = req.body;
  const customerId = req.user.id;
  let splitMsg = '';
  const options = {
    where: { customer_id: customerId, id: splitPackid },
  };
  const packages = await Package
    .find(options);
  if (packages) {
    splitMsg = req.body.message;
  }
  // sending mail is pending here
  await Package.update(
    { status: 'split', review: 'Split package requested', split_pack: splitMsg },
    { where: { id: splitPackid } },
  );
  const notification = {};
  notification.customer_id = customerId;
  notification.action_type = 'package';
  notification.action_id = splitPackid;
  notification.action_description = 'Split package requested - Order#'.concat(splitPackid);
  await Notification.create(notification)
    .then(() => res.status(201).json({ message: 'Your Split Package request has been submitted to shoppre team.' }));
};

exports.abandon = async (req, res) => {
  const { abandonPackid } = req.body;
  console.log(abandonPackid);
  const customerId = req.user.id;
  // sending mail is pending here
  await Package.update(
    { status: 'abandon' },
    { where: { id: abandonPackid } },
  );
  const notification = {};
  notification.customer_id = customerId;
  notification.action_type = 'package';
  notification.action_id = abandonPackid;
  notification.action_description = 'Abandon package request  - Order#'.concat(abandonPackid);
  await Notification.create(notification)
    .then(() => res.status(201).json({ message: 'All items in your package has been discarded as per your request. You can no longer retrieve the items in your package.' }));
};
