const {
  PackageCharge,
} = require('../../../conn/sqldb');

exports.show = async (req, res, next) => {
  try {
    const { id } = req.params;

    const packageCharge = await PackageCharge
      .findById(id, {
        attributes: [
          'storage_amount', 'wrong_address_amount', 'special_handling_amount', 'receive_mail_amount',
          'pickup_amount', 'standard_photo_amount', 'advanced_photo_amount', 'scan_document_amount',
          'split_package_amount',
        ],
      });

    return res.json(packageCharge || {});
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const packageCharge = req.body;
    packageCharge.id = req.params.id;

    await PackageCharge
      .upsert(packageCharge);

    return res.json({ id: req.params.id });
  } catch (err) {
    return next(err);
  }
};
