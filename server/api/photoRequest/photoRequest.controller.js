const debug = require('debug');

const {
  Package, PhotoRequest, PackageMeta, Notification, PackageItem,
} = require('./../../conn/sqldb');

const log = debug('s.photoRequest.controller');
const { PHOTO_REQUEST_TYPES: { STANDARD }, PHOTO_REQUEST_STATES: { COMPLETED } } = require('./../../config/constants');


exports.photoRequest = async (req, res) => {
  const customerId = req.user.id;
  const { packageId } = req.body;
  let status = '';
  const options = {
    attributes: ['id'],
    where: { id: packageId },
  }
  log('pack_id', packageId);
  if (packageId) {
    const packages = await Package
      .find(options);
    console.log(options);
    if (packages) {
      const packageItems = await PackageItem
        .find({ attributes: ['object'] }, { where: { package_id: packages.id } });
      status = packageItems.object === null ? 'pending' : 'completed';
      const photoRequest = {};
      photoRequest.package_id = packageId;
      photoRequest.type = STANDARD;
      photoRequest.status = COMPLETED;
      photoRequest.charge_amount = 50.00;
      await PhotoRequest.create(photoRequest);

      await PackageMeta
        .update({ basic_photo_amount: 50.00 }, { where: { package_id: packageId } });

      const notification = {};
      notification.customer_id = customerId;
      notification.action_type = 'package';
      notification.action_id = packageId;
      notification.action_description = 'Requested for Standard Photos  - Order#'.concat(packageId);
      await Notification.create(notification);

      if (status === 'completed') {
        return res.status(201).json({ error: '0', status, photos: packages.object });
      }

      if (status === 'pending') {
        await Package
          .update({ status: 'review', review: 'Requested for Standard Photos' }, { where: { id: packageId } });
        return res.status(201).json({ error: '1', status });
      }
    } else {
      return res.json({ error: 'Package not found' }).status(201);
    }
  } else {
    return res.json({ error: 2 });
  }
  return res.status(201);
};
