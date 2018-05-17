

const { ShipRequest, Country } = require('../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'full_name', 'address', 'weight', 'estimated'],
    include: [{
      model: Country,
      attributes: ['id', 'name'],
    }],
  };
  if (req.query.customer_id) { options.where = { customer_id: req.query.customer_id }; }

  return ShipRequest
    .findAll(options)
    .then(shipRequests => res.render('shipRequest/index', { shipRequests: shipRequests.map(x => x.toJSON()) }))
    .catch(next);
};

exports.show = (req, res, next) => ShipRequest
  .findById(req.params.id, {
    attributes: ['id', 'full_name', 'address', 'weight', 'estimated'],
    include: [{
      model: Country,
      attributes: ['id', 'name'],
    }],
  })
  .then((shipRequest) => {
    if (!shipRequest) return res.render('404');
    console.log(shipRequest);
    return res.render('shipRequest/show', shipRequest.toJSON());
  })
  .catch(next);

