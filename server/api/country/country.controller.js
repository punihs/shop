const rp = require('request-promise');

const { Country } = require('../../conn/sqldb');

exports.index = async (req, res, next) => {
  try {
    const countries = await Country
      .findAll({
        attributes: [
          'id', 'name', 'slug', 'iso2', 'iso3', 'currency_code', 'capital_city',
          'discount_percentage', 'is_shipping_available', 'flag',
        ],
        limit: Number(req.query.limit) || 20,
        offset: Number(req.query.offset) || 0,
      });

    return res.json(countries);
  } catch (err) {
    return next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const country = await Country
      .find({
        attributes: [
          'id', 'name', 'slug', 'iso2', 'iso3', 'currency_code', 'capital_city',
          'discount_percentage', 'is_shipping_available',
        ],
        where: { slug },
        raw: true,
      });

    if (!country) return res.status(400).end();

    const q = `INR_${country.currency_code}`;

    const response = await rp({
      uri: `http://free.currencyconverterapi.com/api/v3/convert?q=${q}&compact=ultra`,
      json: true,
    });

    if (!response) {
      return res.status(400).end();
    }

    return res.json({
      ...country,
      exchangeRate: response[q],
    });
  } catch (err) {
    return next(err);
  }
};
