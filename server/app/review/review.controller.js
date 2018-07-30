const rp = require('request-promise');
const { URLS_API } = require('../../config/environment');

exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/reviews`, { json: true }),
  ])
  .then(([reviews]) =>
    res
      .render('review/index', Object
        .assign(reviews, {
          s3BaseUrl: req.s3BaseUrl,
          title: 'Shoppre Member Ratings &amp; Reviews - Shoppre Customer Reviews',
          meta_description: 'Read our latest Review &amp; Ratings showcasing the excellent service and ship on time. Shoppre members love our top-rated service and how easy and worry-free we make shopping and shipping from INDIA',
          meta_kewords: 'title',
          reviews,
        })))
  .catch(next);
