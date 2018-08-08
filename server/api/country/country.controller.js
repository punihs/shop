const rp = require('request-promise');
const { Country, CountryGuide, Review } = require('../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: [
      'id', 'name', 'slug', 'iso2', 'iso3', 'phone_code', 'currency_code', 'capital_city',
      'discount_percentage', 'is_shipping_available', 'flag',
    ],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  return Country
    .findAll(options)
    .then(countries => res.json(countries))
    .catch(next);
};

exports.show = (req, res, next) => {
  const { slug } = req.params;

  return Country
    .find({
      attributes: [
        'id', 'name', 'slug', 'iso2', 'iso3', 'phone_code', 'currency_code', 'capital_city',
        'discount_percentage', 'is_shipping_available',
      ],
      include: [{
        model: CountryGuide,
        attributes: ['id'],
      }, {
        model: Review,
        attributes: ['id'],
        where: {
          approved_by: 1,
        },
        limit: 20,
      }],
      where: { slug },
      raw: true,
    })
    .then((country) => {
      if (!country) return res.status(400).end();

      const q = `INR_${country.currency_code}`;

      return rp({
        uri: `http://free.currencyconverterapi.com/api/v3/convert?q=${q}&compact=ultra`,
        json: true,
      })
        .then(response => res
          .json({
            ...country,
            exchangeRate: response[q],
          }));
    })
    .catch(next);
};
