
const rp = require('request-promise');
const { URLS_API } = require('../../config/environment');

exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/countries`, { json: true }),
  ])
  .then(([countries]) => {
    // return res.json(Object
    //   .assign(faqs, {
    //     logo: '/img/dhl.png',
    //   }));
    res.render('countryGuide/index', {
      title: 'Country title',
      meta_description: 'Country_metaDesctription',
      meta_title: 'Country_metaTitle',
      countries,
    });
  })
  .catch(next);

exports.show = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/countries/${req.params.slug}`, { json: true }),
  ])
  .then(([country, countries, reviews, countryGuide]) => {
    // return res.json(Object
    //   .assign(country, {
    //     reviews,
    //     countryGuide,
    //     countries,
    //   }));
    res
      .render('countryGuide/show', Object
        .assign(country, {
          title: 'International Shipping from India, Flipkart International Delivery',
          meta_description: 'Meta Title International Shipping from India, Flipkart International Delivery',
          meta_title: 'Meta Description International Shipping from India, Flipkart International Delivery',
          country,
          reviews,
          countryGuide,
          countries,
        }));
  })
  .catch(next);
