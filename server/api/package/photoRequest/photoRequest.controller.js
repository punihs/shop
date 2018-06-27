const debug = require('debug');

const {
  Package, PhotoRequest, PackageCharge, Notification, PackageItem,
} = require('../../../conn/sqldb');

const log = debug('s.photoRequest.controller');
const {
  PHOTO_REQUEST_TYPES: { BASIC, ADVANCED },
  PHOTO_REQUEST_STATES: { COMPLETED },
  PACKAGE_CHARGES: { BASIC_PHOTO, ADVANCED_PHOTO },
} = require('../../../config/constants');

exports.create = (req, res, next) => {
  log('photoRequest', req.body);
  const customerId = req.user.id;
  const { id: packageId } = req.params;
  const { type } = req.body;
  const IS_BASIC_PHOTO = type === 'basic_photo';

  const CHARGE = IS_BASIC_PHOTO ? BASIC_PHOTO : ADVANCED_PHOTO;
  const REVEW_TEXT = IS_BASIC_PHOTO ? 'Basic' : 'Advanced';
  let status = '';

  log('package_id', packageId);
  if (!packageId && !Number(packageId)) {
    return res.status(400).json({ message: 'arg:package_id missing.' });
  }

  return Package
    .find({
      attributes: ['id'],
      where: { id: packageId },
    })
    .then(async (pkg) => {
      if (!pkg) return res.status(400).json({ message: 'Package not found.' });

      // Todo: picking only one item
      const packageItem = await PackageItem
        .find({ attributes: ['object'] }, { where: { package_id: pkg.id } });

      status = packageItem.object === null
        ? 'pending'
        : 'completed';

      await PhotoRequest.create({
        package_id: packageId,
        type: IS_BASIC_PHOTO ? BASIC : ADVANCED,
        status: COMPLETED,
        charge_amount: CHARGE,
      });

      await PackageCharge
        .upsert({ id: packageId, [`${type}_amount`]: CHARGE });

      await Notification.create({
        customer_id: customerId,
        action_type: 'package',
        action_id: packageId,
        action_description: `Requested for ${REVEW_TEXT} Photos  - Order# ${packageId}`,
      });

      if (status === 'completed') {
        return res
          .json({
            error: '0',
            status,
            photos: pkg.object,
          });
      }

      // - status === 'pending'
      await pkg
        .update({
          status: 'review',
          review: `Requested for ${REVEW_TEXT} Photos`,
        });

      return res.status(201).json({ error: '1', status });
    })
    .catch(next);
};
