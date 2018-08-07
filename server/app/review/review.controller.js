const moment = require('moment');

const rp = require('request-promise');
const { URLS_API } = require('../../config/environment');

exports.index = (req, res, next) => {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;

  return Promise
    .all([
      rp(`${URLS_API}/api/reviews?limit=${limit}&offset=${offset}`, { json: true }),
      rp(`${URLS_API}/api/countries?limit=236`, { json: true }),
    ])
    .then(([response, countries]) => res
      .render('review/index', {
        ...response,
        offset,
        moment,
        countries,
        s3BaseUrl: req.s3BaseUrl,
        title: 'Shoppre Member Ratings & Reviews - Shoppre Customer Reviews',
        meta_description: 'Read our latest Review &amp; Ratings showcasing the excellent service and ship on time. Shoppre members love our top-rated service and how easy and worry-free we make shopping and shipping from INDIA',
        meta_kewords: 'title',
      }))
    .catch(next);
};

