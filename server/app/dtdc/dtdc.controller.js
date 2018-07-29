const rp = require('request-promise');
const { URLS_API } = require('../../config/environment');

exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/shippingPartners/partners?type=dhl`, { json: true }),
  ])
  .then(([shipments]) => {
    // return res.json({
    //   shipments,
    // });
    res
      .render('dhl/index', Object
        .assign(shipments, {
          title: 'International Shipping from India, Flipkart International Delivery',
          meta_description: 'Meta Title International Shipping from India, Flipkart International Delivery',
          meta_title: 'Meta Description International Shipping from India, Flipkart International Delivery',
        }));
  })
  .catch(next);

exports.show = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/shippingPartners/${req.params.slug}`, { json: true }),
  ])
  .then(([shippingPartner, seo]) =>
    res
      .render('shippingPartner/show', Object
        .assign(shippingPartner, {
          seo,
          title: 'International Shipping from India, Flipkart International Delivery',
          meta_description: 'Meta Title International Shipping from India, Flipkart International Delivery',
          meta_title: 'Meta Description International Shipping from India, Flipkart International Delivery',
          logo: '/app/img/dhl.png',
        })))
  .catch(next);

