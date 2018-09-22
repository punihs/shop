const {
  PackageCharge,
} = require('../../../conn/sqldb');

exports.show = (req, res, next) => {
  const { id } = req.params;
  const options = {
    attributes: [
      'storage_amount', 'wrong_address_amount', 'special_handling_amount', 'receive_mail_amount',
      'pickup_amount', 'standard_photo_amount', 'advanced_photo_amount', 'scan_document_amount',
      'split_package_amount',
    ],
  };

  return PackageCharge
    .findById(id, options)
    .then(packageCharge => res.json(packageCharge || {}))
    .catch(next);
};

exports.update = async (req, res, next) => {
  const packageCharge = req.body;
  packageCharge.id = req.params.id;

  return PackageCharge
    .upsert(packageCharge)
    .then(() => res.json({ id: req.params.id }))
    .catch(next);
};
