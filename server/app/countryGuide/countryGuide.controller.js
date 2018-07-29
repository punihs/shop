
const rp = require('request-promise');
const { URLS_API, URLS_MYACCOUNT, s3BaseUrl } = require('../../config/environment');


exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/countries`, { json: true }),
  ])
  .then(([countries]) => {
    res.render('countryGuide/index', {
      URLS_MYACCOUNT,
      s3BaseUrl,
      title: 'Country Guides | Shoppre - International Shipping Partner',
      meta_description: 'Know how Shoppre a parcel forwarding &amp; international shipping services work for online shopping in India while ensuring fast service at unbelievably low prices.',
      meta_keywords: 'know how, shoppre, parcel forwarding, international shipping services, online shopping in india, fast service, dhl, fedex, dtdc',
      countries,
    });
  })
  .catch(next);


exports.show = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/countries/${req.params.slug}`, { json: true }),
    rp(`${URLS_API}/api/countries/${req.params.slug}`, { json: true }),
  ])
  .then(([country]) => {
    res
      .render('countryGuide/show', Object
        .assign(country, {
          URLS_MYACCOUNT,
          s3BaseUrl,
          title: 'Country Guides | Shoppre - International Shipping Partner',
          meta_description: 'Know how Shoppre a parcel forwarding &amp; international shipping services work for online shopping in India while ensuring fast service at unbelievably low prices.',
          meta_keywords: 'know how, shoppre, parcel forwarding, international shipping services, online shopping in india, fast service, dhl, fedex, dtdc',
        }));
  })
  .catch(next);

