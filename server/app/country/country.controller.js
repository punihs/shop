
const rp = require('request-promise');
const { URLS_API } = require('../../config/environment');

exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/places`, { json: true }),
  ])
  .then(([countries]) =>
    res
      .render('country/index', countries, {
        title: 'Country title',
        meta_description: 'Country_metaDesctription',
        meta_title: 'Country_metaTitle',
      }))
  .catch(next);

exports.show = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/places/${req.params.slug}`, { json: true }),
  ])
  .then(([countries]) =>
    res
      .render('country/show', Object
        .assign(countries, {
          logo: '/cdn/img/stores.png',
          title: 'Country title',
          meta_description: 'Country_metaDesctription',
          meta_title: 'Country_metaTitle',
          discription: 'Description',
          countries,
        })))
  .catch(next);

