const { ShippingPartner, sequelize } = require('../../conn/sqldb');
const Sequelize = require('sequelize');
const countries = require('./countries.json');

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
      join \`shipments\` on shipping_partners.id = shipments.pickup_id 
      where shipping_partners.id = ${shippingPartner.id}`;

  const shipDate = `SELECT date(shipments.created_at) created_at, count(1) cnt FROM shipping_partners
      join \`ship_trackings\` on shipping_partners.slug = ship_trackings.carrier
      JOIN shipments on shipments.id = ship_trackings.ship_request_id
      where shipping_partners.id = ${shippingPartner.id}
      group by date(shipments.created_at)`;

  const keywordByPartner = `select name from \`partner_keywords\` where partner_id =${shippingPartner.id}`;

  const keywordCount = `select count(1)cnt from partner_keywords where partner_id = ${shippingPartner.id}`;

  const pickupCnt = `SELECT count(1)cnt FROM shipping_partners
      join \`ship_trackings\` on shipping_partners.slug = ship_trackings.carrier
      JOIN shipments on shipments.id = ship_trackings.ship_request_id
      where shipping_partners.id = ${shippingPartner.id}`;


  const countryServed = `SELECT count(distinct(countries.slug)) as cnt FROM shipping_partners
      join \`ship_trackings\` on shipping_partners.slug = ship_trackings.carrier
      JOIN shipments on shipments.id = ship_trackings.ship_request_id
      JOIN countries on countries.id = shipments.country_id
      where shipping_partners.id = ${shippingPartner.id}`;

  const contryByPartner = `SELECT countries.slug as name, count(1) as cnt FROM shipping_partners
      join \`ship_trackings\` on shipping_partners.slug = ship_trackings.carrier
      JOIN shipments on shipments.id = ship_trackings.ship_request_id
      JOIN countries on countries.id = shipments.country_id
      where shipping_partners.id =${shippingPartner.id}
      group by countries.slug  order by cnt desc`;

  const shipmentByPartner = `SELECT shipments.* FROM shipping_partners
      join \`ship_trackings\` on shipping_partners.slug = ship_trackings.carrier
      JOIN shipments on shipments.id = ship_trackings.ship_request_id
      where shipping_partners.id = ${shippingPartner.id}`;

  const follwers = `select count(1) cnt from users 
      join partner_followers on partner_followers.customer_id = users.id
      where partner_followers.partner_id = ${shippingPartner.id}`;

  const followerBypartner = `select name from users 
      join partner_followers on partner_followers.customer_id = users.id
      where partner_followers.partner_id = ${shippingPartner.id}`;

  const internationalCitiesServed = `SELECT  shipments.city_id id, countries.name  name FROM shipping_partners
        join \`ship_trackings\` on shipping_partners.slug = ship_trackings.carrier
        JOIN shipments on shipments.id = ship_trackings.ship_request_id
        JOIN countries on countries.id = shipments.country_id
        where shipping_partners.id = ${shippingPartner.id} and shipments.city_id is not null`;

  const issues = `SELECT ship_issues.id AS id, ship_issues.name AS name , ship_issues.description FROM shipping_partners
        join \`ship_trackings\` on shipping_partners.slug = ship_trackings.carrier
        JOIN shipments on shipments.id = ship_trackings.ship_request_id
        join ship_issues on ship_issues.ship_request_id = shipments.id
        where shipping_partners.id =${shippingPartner.id}`;
  const review = `SELECT reviews.person as person, reviews.source as source, reviews.review as review , reviews.rating as rating 
        FROM shipping_partners join ship_trackings on shipping_partners.slug = ship_trackings.carrier
        JOIN shipments on shipments.id = ship_trackings.ship_request_id
        join reviews on reviews.ship_request_id = shipments.id
        where shipping_partners.id = ${shippingPartner.id}`;

  const quickLinks = `select name, url from partner_links where partner_id = ${shippingPartner.id}`;

  const [count] = await sequelize.query(countQuery, { type: Sequelize.QueryTypes.SELECT });
  const [follwerscount] = await sequelize
    .query(follwers, { type: Sequelize.QueryTypes.SELECT });
  const follwerByPartners = await sequelize
    .query(followerBypartner, { type: Sequelize.QueryTypes.SELECT });
  const shipByDates = await sequelize.query(shipDate, { type: Sequelize.QueryTypes.SELECT });
  const interNationalcities = await sequelize
    .query(internationalCitiesServed, { type: Sequelize.QueryTypes.SELECT });
  const keywordsByPartner = await sequelize
    .query(keywordByPartner, { type: Sequelize.QueryTypes.SELECT });
  const [keywordscount] = await sequelize
    .query(keywordCount, { type: Sequelize.QueryTypes.SELECT });
  const [PickupCountBypartner] = await sequelize
    .query(pickupCnt, { type: Sequelize.QueryTypes.SELECT });
  const [contrytillserved] = await sequelize
    .query(countryServed, { type: Sequelize.QueryTypes.SELECT });
  const contriesBypartner = await sequelize
    .query(contryByPartner, { type: Sequelize.QueryTypes.SELECT });
  const shipbypartner = await sequelize
    .query(shipmentByPartner, { type: Sequelize.QueryTypes.SELECT });
  const quickLink = await sequelize
    .query(quickLinks, { type: Sequelize.QueryTypes.SELECT });
  const issue = await sequelize.query(issues, { type: Sequelize.QueryTypes.SELECT });
  const reviews = await sequelize.query(review, { type: Sequelize.QueryTypes.SELECT });

  // return res.json({ issue });

  shippingPartner.description = 'DHL Express is a division of the German logistics company Deutsche Post ';

  const ratingMap = {
    1: '',
    2: '',
    3: '',
    4: '',
    5: 'Excellent',
  };

  return res.render('shippingPartner/show', {
    ratingMap,
    count,
    PickupCountBypartner,
    contrytillserved,
    follwerscount,
    keywordscount,
    shipByDates,
    keywordsByPartner,
    follwerByPartners,
    countries,
    interNationalcities,
    quickLink,
    contriesBypartner,
    shipbypartner,
    issue,
    reviews,
    shippingPartner,
    rating: 5,
    ratingCount: 10,
  });
};

