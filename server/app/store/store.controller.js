const rp = require('request-promise');
const { URLS_API, s3BaseUrl, URLS_MYACCOUNT } = require('../../config/environment');

exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/storeCategory`, { json: true }),
  ])
  .then(([countries, states]) => {
    res.render('store/show', Object
      .assign(countries, {
        states,
        s3BaseUrl,
        URLS_API,
        URLS_MYACCOUNT,
        title: 'Shoppre Consolidation Service - Save On Shipping Costs',
        meta_description: 'Shoppre help in reducing Shipping cost by Combining your packages from multiple stores to one tracking number, and save upto 60% - 80% on shipping rates!',
        meta_keywords: 'shoppre, consolidation service, save on shipping costs, multiple stores, packages',
      }));
  })
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

