
const rp = require('request-promise');
const { URLS_API } = require('../../config/environment');

exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/faqs`, { json: true }),
  ])
  .then(([faqs]) => {
    res.render('faq/index', Object
      .assign(faqs, {
        title: 'Country title',
        meta_description: 'Country_metaDesctription',
        meta_title: 'Country_metaTitle',
        discription: 'Description',
      }));
  })
  .catch(next);

exports.show = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/faqs/${req.params.slug}`, { json: true }),
  ])
  .then(([faq]) =>
    res
      .render('faq/show', Object
        .assign(faq, {
          title: 'Country title',
          meta_description: 'Country_metaDesctription',
          meta_title: 'Country_metaTitle',
          discription: 'Description',
        })))
  .catch(next);

