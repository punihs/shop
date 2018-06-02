const {
  ShippingPartner, Shipment, ShipmentIssue, Keyword, Review, Link,
} = require('../../conn/sqldb');

const countries = require('./../../components/pricing/dhl/data/countries');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'slug'],
  };

  return ShippingPartner
    .findAll(options)
    .then(shippingPartners => res.json(shippingPartners))
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

  if (!shippingPartner) return res.status(404).end();

  const shipmentCount = await Shipment.count({
    where: { shipping_partner_id: shippingPartner.id },
  });

  const reviews = await Review.findAll({
    include: [{ model: Shipment, where: { shipping_partner_id: shippingPartner.id } }],
  });

  const keywords = await Keyword.findAll({
    where: {
      object_type_id: 1,
      object_id: shippingPartner.id,
    },
  });

  const links = await Link.findAll({
    where: {
      object_type_id: 1,
    },
  });

  const issues = await ShippingPartner.findAll({
    where: { id: shippingPartner.id },
    include: [{
      model: Shipment,
      include: [{
        model: ShipmentIssue,
        attributes: ['id', 'name', 'description'],
      }],
    }],
  });
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
    issues,
    reviews,
    links,
    keywords,
    countries: countries.map(({ country: name, country_code: iso2 }) =>
      ({ iso2, name })), // serving countries
    rating: 5,
    ratingCount: 10,
    count: shipmentCount,
  }));
};
