

const {
  Seo,
} = require('../../conn/sqldb');

exports.index = (req, res, next) => {
  const { domain, path } = req.query;
  return Seo
    .find({
      attributes: ['title', 'meta_title', 'meta_description'],
      where: {
        domain, path,
      },
    })
    .then(seo => res.json(seo))
    .catch(next);
};
