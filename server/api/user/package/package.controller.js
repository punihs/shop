const { Package, Store, PackageState } = require('../../../conn/sqldb');

const { PACKAGE_STATES } = require('../../../config/constants');

exports.index = (req, res, next) => {
  const options = {
    attributes: [
      'id', 'created_at', 'reference_code', 'price_amount',
      'weight', 'is_doc', 'package_state_id', 'store_id',
    ],
    where: {
      customer_id: req.params.userId,
    },
    include: [{
      model: Store,
      attributes: ['id', 'name'],
    }, {
      model: PackageState,
      attributes: ['id', 'state_id'],
    }],
    limit: Number(req.query.limit) || 20,
  };
  const states = Object.values(PACKAGE_STATES);
  if (states.includes(req.query.status)) options.where.status = req.query.status;

  return Promise
    .all([
      Package
        .findAll(options),
      Package.count({
        where: options.where,
      }),
    ])
    .then(([packages, total]) => res
      .json({
        packages: packages
          .map(pkg => ({
            ...pkg.toJSON(),
            state_id: pkg.PackageState.state_id,
          })),
        total,
      }))
    .catch(next);
};
