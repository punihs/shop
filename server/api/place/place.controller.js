const { Place, Shipment } = require('./../../conn/sqldb');

exports.index = (req, res, next) => {
  const { type } = req.query;
  const options = {
    where: {},
    attributes: req.query.fl
      ? req.query.fl.split(',')
      : ['id', 'name', 'slug', 'type'],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  if (type === 'destination_cities') {
    options.include = [{
      model: Shipment,
      attributes: ['weight', 'courier_charge_amount'],
    }];
  } else if (type === 'indian_states') {
    options.where.type = 'state';
    options.where.parent_id = 86;
  } else {
    options.where.type = type;
  }

  return Place
    .findAll(options)
    .then(places => res.json(places))
    .catch(next);
};
