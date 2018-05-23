const { ShippingPartner, sequelize } = require('../../conn/sqldb');
const Sequelize = require('sequelize');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'name', 'slug'],
  };

  return ShippingPartner
    .findAll(options)
    .then(shippingPartners => res.render('shippingPartner/index', {
      shippingPartners: shippingPartners.map(x => x.toJSON()),
    }))
    .catch(next);
};

exports.show = async (req, res) => {
  const shippingPartner = await ShippingPartner
    .find({
      where: {
        slug: req.params.slug,
      },
      attributes: ['id', 'name', 'slug'],
      raw: true,
    });

  if (!shippingPartner) return res.render('404');

  const countQuery = `
    SELECT count(1) as cnt FROM shipping_partners
    join \`ship_trackings\` on shipping_partners.slug = ship_trackings.carrier
    JOIN ship_requests on ship_requests.id = ship_trackings.ship_request_id
    where shipping_partners.id = ${shippingPartner.id}
    `;

  const [count] = await sequelize.query(countQuery, { type: Sequelize.QueryTypes.SELECT });

  return res.render('shippingPartner/show', { shippingPartner, count });
};

