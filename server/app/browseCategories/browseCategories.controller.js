const rp = require('request-promise');
const { URLS_MYACCOUNT, URLS_API } = require('../../config/environment');

exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/storeCategory`, { json: true }),
  ])
  .then((Categories) => {
    res.render('browseCategories/index', {
      Categories,
      s3BaseUrl: req.s3BaseUrl,
      URLS_MYACCOUNT,
      title: 'Browse Categories: List of Top Indian Shopping Sites | Shoppre',
      meta_disctription: 'Shop from list of Top Indian Shopping Sites, Facebook &amp; Instagram Sellers. Save by combining multiple packages into one and get it shipped to your country.',
      meta_keywords: 'shop, list of top indian shopping sites, facebook, instagram sellers, multiple packages, shipped to your country',
    });
  })
  .catch(next);