const rp = require('request-promise');
const { URLS_MYACCOUNT } = require('../../config/environment');
const { URLS_API } = require('../../config/environment');

exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/stores`, { json: true }),
  ])
  .then(([stores]) => {
    // return res.json(Object
    //   .assign(stores, {
    //     stores,
    //     logo: '/img/dhl.png',
    //   }));
    res.render('browseCategories/index', {
      URLS_MYACCOUNT,
      title: 'aboutpage',
      meta_disctription: 'discription',
      meta_title: 'metatital',
      stores,
      categories: 'apperals',
      fbs: 'Fbs',
    });
  })
  .catch(next);

