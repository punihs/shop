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

  const review = `SELECT reviews.person, reviews.source, reviews.review, reviews.rating FROM shipping_partners
    JOIN shipments on  shipping_partners.id = shipments.shipping_partner_id
    join reviews on reviews.shipment_id = shipments.id
    where shipping_partners.id = ${shippingPartner.id}`;

  const quicklinks = `Select partner_links.name,partner_links.url from partner_links ,shipping_partners
    WHERE partner_links.shipping_partners_id=shipping_partners.id
    and shipping_partners.id=${shippingPartner.id}`;

  const keyword = `SELECT keywords.name FROM keywords, shipping_partners WHERE shipping_partners.id=${shippingPartner.id}`;

  const [count] = await sequelize.query(
    countQuery,
    { type: Sequelize.QueryTypes.SELECT },
  );

  const shippingissue = await sequelize.query(
    shippingIssues,
    { type: Sequelize.QueryTypes.SELECT },
  );
  const reviews = await sequelize.query(
    review,
    { type: Sequelize.QueryTypes.SELECT },
  );

  const quicklink = await sequelize.query(
    quicklinks,
    { type: Sequelize.QueryTypes.SELECT },
  );
  const keywords = await sequelize.query(
    keyword,
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
    reviews,
    quicklink,
    keywords,
    countries: countries.map(({ country: name, country_code: iso2 }) =>
      ({ iso2, name })), // serving countries
    rating: 5,
    ratingCount: 10,
    count,
  }));
};
