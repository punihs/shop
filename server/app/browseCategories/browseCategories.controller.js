const rp = require('request-promise');
const { URLS_MYACCOUNT, URLS_API, URLS_WWW } = require('../../config/environment');

exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/storeCategory`, { json: true }),
  ])
  .then((Categories) => {
    // return res.json({
    //   Categories,
    // });
    res.render('browseCategories/index', {
      Categories,
      // stores,
      URLS_MYACCOUNT,
      URLS_WWW,
      title: 'Browse Categories: List of Top Indian Shopping Sites | Shoppre',
      meta_disctription: 'Shop from list of Top Indian Shopping Sites, Facebook &amp; Instagram Sellers. Save by combining multiple packages into one and get it shipped to your country.',
      meta_keywords: 'shop, list of top indian shopping sites, facebook, instagram sellers, multiple packages, shipped to your country',
      // stores,
    });
  })
  .catch(next);
