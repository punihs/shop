const rp = require('request-promise');
const { Country, CountryGuide, Review } = require('../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: [
      'id', 'name', 'slug', 'iso2', 'iso3', 'phone_code', 'currency_code', 'capital_city',
      'discount_percentage', 'is_shipping_available',
    ],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,

  };
  return Country
    .findAll(options)
    .then(country => res.json(country))
    .catch(next);
};


exports.show = async (req, res) => {
  const { slug } = req.params;
  let country = '';
  let countries = '';
  let countryGuide = '';
  let reviews = '';

  const options = {
    attributes: [
      'id', 'name', 'slug', 'iso2', 'iso3', 'phone_code', 'currency_code', 'capital_city',
      'discount_percentage', 'is_shipping_available',
    ],
    where: { slug },
  };

  const optionsAll = {
    attributes: [
      'id', 'name', 'slug', 'iso2', 'iso3', 'phone_code', 'currency_code', 'capital_city',
      'discount_percentage', 'is_shipping_available',
    ],
  };

  country = await Country.find(options);
  if (country) {
    countries = await Country.findAll(optionsAll);
    countryGuide = await CountryGuide
      .findAll({
        where: { country_id: country.id },
      });
    const optionReview = {
      where: {
        country_id: country.id,
        approved_by: 1,
      },
      limit: Number(req.query.limit) || 20,
      offset: Number(req.query.offset) || 0,
    };

    reviews = await Review
      .findAll(optionReview);
    const fromTo = `INR_${country.currency_code}`;
    const currency = await await rp(`http://free.currencyconverterapi.com/api/v3/convert?q=${fromTo}&compact=ultra`);
    const usdInr = JSON.parse(currency);

    console.log('fromTo: ', currency);
    console.log('d: ', fromTo);
    console.log('data: ', usdInr[0]);

    for (const key in usdInr) {
      const infoJSON = usdInr[key];
    }
  }

  return res.json(Object.assign(country, {
    countries,
    countryGuide,
    reviews,
  }));
  // return res.json({
  //   country, countries, countryGuide, reviews,
  // });
};
