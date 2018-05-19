

const { Shipment, Country } = require('../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'full_name', 'address', 'weight', 'estimated'],
    include: [{
      model: Country,
      attributes: ['id', 'name'],
    }],
  };
  if (req.query.customer_id) { options.where = { customer_id: req.query.customer_id }; }

  return Shipment
    .findAll(options)
    .then(shipments => res.render('shipment/index', { shipments: shipments.map(x => x.toJSON()) }))
    .catch(next);
};

exports.show = (req, res, next) => Shipment
  .findById(req.params.id, {
    attributes: ['id', 'full_name', 'address', 'weight', 'estimated'],
    include: [{
      model: Country,
      attributes: ['id', 'name'],
    }],
  })
  .then((shipment) => {
    if (!shipment) return res.render('404');

    return res.render('shipment/show', shipment.toJSON());
  })
  .catch(next);

