const rp = require('request-promise');

exports.show = (req, res, next) => Promise
  .all([
    rp('http://api.shoppre.test/api/shippingPartners/dhl', { json: true }),
    // rp('http://api.shoppre.test/api/seo?domain=shoppre.com&object_type=shipping-partners&object_slug=dhl'),
    // ${req.path}
    rp('http://api.shoppre.test/api/seo?domain=shoppre.test&path=/shipping-partners/dhl', { json: true }),
  ])
  .then(([shippingPartner, seo]) =>
    //    return res.json(Object
    // .assign(shippingPartner, {
    //     seo,
    //     logo: '/img/dhl.png',
    //   }));
    res
      .render('shippingPartner/show', Object
        .assign(shippingPartner, {
          seo,
          logo: '/img/dhl.png',
        })))
  .catch(next);

