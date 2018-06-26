const rp = require('request-promise');
const { URLS_MYACCOUNT } = require('../../config/environment');
const { URLS_API } = require('../../config/environment');

exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/stores`, { json: true }),
  ])
  .then(([stores]) =>
    res.render('browseCategories/index', Object
      .assign(stores, {
        URLS_MYACCOUNT,
        title: 'aboutpage',
        meta_disctription: 'discription',
        meta_title: 'metatital',
      })))
  .catch(next);

