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
          title: 'review',
          meta_description: 'disctription',
          meta_title: 'title',
          reviews,
        })))
  .catch(next);
