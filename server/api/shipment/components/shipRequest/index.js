const debug = require('debug');

const log = debug('calcPackageLevelCharges');

const keys = [
  'storage_amount', 'wrong_address_amount', 'special_handling_amount', 'receive_mail_amount',
  'pickup_amount', 'standard_photo_amount', 'advanced_photo_amount', 'split_package_amount',
  'scan_document_amount',
];

const onePackageCharge = (packageCharge) => {
  log('onePackageCharge', packageCharge);
  return keys
    .reduce((nxty, key) => (nxty + (packageCharge[key] || 0)), 0);
};

module.exports = {
  calcPackageLevelCharges({ packages }) {
    const charges = packages.reduce((nxt, pkg) => {
      const pack = pkg.toJSON();

      const onePackageCharges = onePackageCharge(pack.PackageCharge || {});

      return {
        package_level_charges_amount: nxt.package_level_charges_amount + onePackageCharges,
        value_amount: nxt.value_amount + pack.price_amount,
        weight: nxt.weight + pack.weight,
      };
    }, {
      value_amount: 0,
      weight: 0,
      package_level_charges_amount: 0,
    });
    log('charges', charges);

    return charges;
  },
  calcLiquidCharges({ weight }) {
    switch (true) {
      case weight < 5: return 1392.40;
      case weight < 10: return 3009.00;
      case weight < 15: return 5369.00;
      default: return 7729.00; // weight >= 15;
    }
  },
};
