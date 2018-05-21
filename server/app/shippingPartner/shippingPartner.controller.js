const { Partner, sequelize } = require('../../conn/sqldb');
const Sequelize = require('sequelize');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'name'],
  };

  return Partner
    .findAll(options)
    .then(partners => res.render('partner/index', { partners: partners.map(x => x.toJSON()) }))
    .catch(next);
};

exports.show = async (req, res) => {
  const partner = await Partner
    .find({
      where: {
        slug: req.params.slug,
      },
      attributes: ['id', 'name', 'slug'],
      raw: true,
    });

  if (!partner) return res.render('404');

  const countQuery = `
    SELECT count(1) as cnt FROM partners
    join \`ship_trackings\` on partners.slug = ship_trackings.carrier
    JOIN ship_requests on ship_requests.id = ship_trackings.ship_request_id
    where partners.id = ${partner.id}
    `;

  const [count] = await sequelize.query(countQuery, { type: Sequelize.QueryTypes.SELECT });

  return res.render('partner/show', { partner, count });
};

