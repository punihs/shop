const rp = require('request-promise');
const { URLS_API, URLS_MYACCOUNT } = require('../../config/environment');

exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/countries`, { json: true }),
    rp(`${URLS_API}/api/places?type=indian_states`, { json: true }),
  ])
  .then(([countries, states]) => {
    // return res.json({
    //   countries,
    //   states,
    // });

    res.render('schedulePickup/index', Object
      .assign(countries, {
        states,
        URLS_API,
        URLS_MYACCOUNT,
        s3BaseUrl: req.s3BaseUrl,
        title: 'Shoppre Consolidation Service - Save On Shipping Costs',
        meta_description: 'Shoppre help in reducing Shipping cost by Combining your packages from multiple stores to one tracking number, and save upto 60% - 80% on shipping rates!',
        meta_keywords: 'shoppre, consolidation service, save on shipping costs, multiple stores, packages',
      }));
  })
  .catch(next);
