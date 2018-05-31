const rp = require('request-promise');
const { URLS_API } = require('../../config/environment');

exports.show = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/shippingPartners/${req.params.slug}`, { json: true }),
  ])
  .then(([shippingPartner, seo]) =>
    res
      .render('shippingPartner/show', Object
        .assign(shippingPartner, {
          seo,
          logo: '/img/dhl.png',
        })))
  .catch(next);

