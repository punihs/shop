
const rp = require('request-promise');
const { URLS_API } = require('../../config/environment');

exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/places/state`, { json: true }),
  ])
  .then(([place]) =>
    res
      .render('state/index', Object
        .assign(place, {
          title: 'Country title',
          meta_description: 'Country_metaDesctription',
          meta_title: 'Country_metaTitle',
        })))
  .catch(next);

exports.show = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/places/${req.params.slug}`, { json: true }),
  ])
  .then(([countries]) =>
    res
      .render('state/show', Object
        .assign(countries, {
          logo: '/cdn/img/stores.png',
          title: 'Country title',
          meta_description: 'Country_metaDesctription',
          meta_title: 'Country_metaTitle',
          discription: 'Description',
        })))
  .catch(next);

