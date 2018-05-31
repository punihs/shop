const { Country } = require('../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: [
      'id', 'name', 'slug', 'iso2', 'iso3', 'phone_code', 'currency_code', 'capital_city',
      'discount_percentage', 'is_shipping_available',
    ],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offet) || 0,

  };
  return Country
    .findAll(options)
    .then(country => res.json(country))
    .catch(next);
};
