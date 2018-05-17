

const { Partner, Country } = require('../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'name'],
  };

  return Partner
    .findAll(options)
    .then(partners => res.render('partner/index', { partners: partners.map(x => x.toJSON()) }))
    .catch(next);
};

exports.show = (req, res, next) => Partner
  .find({
    where: {
      name: req.params.name,
    },
    attributes: ['id', 'name'],
  })
  .then((partner) => {
    if (!partner) return res.render('404');
    console.log(partner);
    return res.render('partner/show', partner.toJSON());
  })
  .catch(next);

