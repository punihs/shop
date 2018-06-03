const rp = require('request-promise');
const { URLS_API } = require('../../config/environment');

exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/stores`, { json: true }),
  ])
  .then(([store]) =>
    res
      .render('store/index', store))
  .catch(next);

exports.show = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/stores/${req.params.slug}`, { json: true }),
  ])
  .then(([stores]) =>
    res
      .render('store/show', stores, {
        title: 'Online Shopping: Best Stores for Shopping Online - PayPal CA',
        meta_description: 'Meta Title International Shipping from India, Flipkart International Delivery',
        meta_title: 'Meta Description International Shipping from India, Flipkart International Delivery',
      }))
  .catch(next);

