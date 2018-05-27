const {
  ShippingPartner, sequelize,
} = require('../../conn/sqldb');
const Sequelize = require('sequelize');
const countries = require('./../../components/pricing/dhl/data/countries');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'slug'],
  };

  return ShippingPartner
    .findAll(options)
    .then(partners => res.render('shippingPartner/index', { partners: partners.map(x => x.toJSON()) }))
    .catch(next);
};

exports.show = async (req, res) => {
  const shippingPartner = await ShippingPartner
    .find({
      where: {
        slug: req.params.slug,
      },
      attributes: ['id', 'slug', 'name'],
      raw: true,
    });

  if (!shippingPartner) return res.render('404');

  const countQuery = `SELECT count(1) as cnt FROM shipping_partners
      join \`shipments\` on shipping_partners.id = shipments.shipping_partner_id 
      where shipping_partners.id = ${shippingPartner.id}`;

  const [count] = await sequelize.query(countQuery, { type: Sequelize.QueryTypes.SELECT });

  shippingPartner.description = 'DHL Express is a division of the German logistics company Deutsche Post ';

  const ratingMap = {
    1: '',
    2: '',
    3: '',
    4: '',
    5: 'Excellent',
  };

  return res.json(Object.assign(shippingPartner, countries, count, {
    ratingMap,
    rating: 5,
    ratingCount: 10,
  }));
};
