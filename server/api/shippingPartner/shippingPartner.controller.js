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

  const shippingIssues = `SELECT shipment_issues.id as id,shipment_issues.name as name,shipment_issues.description as des
    FROM shipment_issues ,shipments,shipping_partners 
    where shipment_issues.shipment_id=shipments.id 
    and shipments.shipping_partner_id=shipping_partners.id 
    and shipping_partners.id=${shippingPartner.id}`;

  const [count] = await sequelize.query(
    countQuery,
    { type: Sequelize.QueryTypes.SELECT },
  );

  const shippingissue = await sequelize.query(
    shippingIssues,
    { type: Sequelize.QueryTypes.SELECT },
  );

  shippingPartner.description = 'DHL Express is a division of the German logistics company Deutsche Post ';

  const ratingMap = {
    1: '',
    2: '',
    3: '',
    4: '',
    5: 'Excellent',
  };

  return res.json(Object.assign(shippingPartner, {
    ratingMap,
    shippingissue,
    countries: countries.map(({ country: name, country_code: iso2 }) =>
      ({ iso2, name })), // serving countries
    rating: 5,
    ratingCount: 10,
    count,
  }));
};
