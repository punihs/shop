const { Package } = require('../../../conn/sqldb');

const { PACKAGE_STATES } = require('../../../config/constants');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'created_at'],
    where: {
      customer_id: req.user.id,
      shipment_id: req.params.shipment_id,
    },
    limit: Number(req.query.limit) || 20,
  };
  const states = Object.values(PACKAGE_STATES);
  if (states.includes(req.query.status)) options.where.status = req.query.status;

  return Package
    .findAll(options)
    .then(packages => res.json(packages))
    .catch(next);
};
