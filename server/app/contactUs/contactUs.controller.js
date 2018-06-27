const rp = require('request-promise');
const { URLS_API } = require('../../config/environment');

exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/places`, { json: true }),
  ])
  .then(([countries]) => {
    // return res.json(Object
    //   .assign(countries, {}));
    res
      .render('contactUs/index', {
        title: 'ContactUs',
        meta_description: 'Contact Desctrioption',
        meta_title: 'Contact meta_title ',
        countries,
      });
  })
  .catch(next);
