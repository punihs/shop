/* eslint-disable no-restricted-syntax */
const debug = require('debug');

const log = debug('s.shipment.controller');
const {
  ShippingPartner, Shipment, ShipmentIssue, Keyword, Review, Link, PaymentGateway,
  Country, ShipmentMail,
} = require('../../conn/sqldb');

const countries = require('./../../components/pricing/dhl/data/countries');
const { SHIPPING_PARTNERS_ID: { DHL, FEDEX, DTDC } }
  = require('../../config/constants');
const moment = require('moment');

exports.index = async (req, res, next) => {
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
    include: [{
      model: Shipment,
      where: {
        shipping_partner_id: shippingPartner.id,
      },
    }],
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

exports.list = async (req, res) => {
  const { slug } = req.params;
  log({ slug });
  let shippreId = '';
  switch (slug) {
    case 'dtdc': shippreId = DTDC;
      break;
    case 'fedex': shippreId = FEDEX;
      break;
    default: shippreId = DHL;
      break;
  }

  const shipOption = {
    where: { status: 'delivered' },
    attributes: ['id', 'weight', 'final_amount', 'customer_name', 'shipping_carrier', 'dispatch_date', 'country_id', 'payment_gateway_id'],
    include: [
      {
        model: ShipmentMail,
        attributes: ['condition', 'created_at', 'shipment_id'],
      },
      {
        model: ShippingPartner,
        attributes: ['name'],
        where: { id: shippreId },
      },
      {
        model: Country,
        attributes: ['name'],
      },
      {
        model: PaymentGateway,
        attributes: ['name'],
      },
    ],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  const shipments = await Shipment
    .findAll(shipOption);
  log({ shipments });
  let dispatched = '';
  let delivered = '';
  let days = '';

  // shipments.map((shipment) => {
  //   log(JSON.stringify(shipment));
  //   shipment.shipmentMails.map((shipmentMail) => {
  //     if (shipmentMail.condition === 'ship_dispatched') {
  //       dispatched = moment(shipmentMail.created_at);
  //       log('dispatched', moment(dispatched, 'DD.MM.YYYY'));
  //     } else if (shipmentMail.condition === 'ship_delivered') {
  //       delivered = moment(shipmentMail.created_at);
  //       log('delivered', moment(delivered, 'DD.MM.YYYY'));
  //     }
  //   });
  //   days = delivered.diff(dispatched, 'days');
  //   log({ days });
  // });
  for (const shipment of shipments) {
    for (const shipmentsdate of shipment.shipmentMails) {
      if (shipmentsdate.condition === 'ship_dispatched') {
        dispatched = moment(shipmentsdate.created_at);
        log('dispatched', moment(dispatched, 'DD.MM.YYYY'));
      } else if (shipmentsdate.condition === 'ship_delivered') {
        delivered = moment(shipmentsdate.created_at);
        log('delivered', moment(delivered, 'DD.MM.YYYY'));
      }
    }
    days = delivered.diff(dispatched, 'days');
    log({ days });
  }

  log({ shipments });
  return res.json({
    shipments,
    days,
  });
};

exports.detail = async (req, res) => {
  const { id } = req.params;
  log(req.params);
  log({ id });


  const shipOption = {
    where: { status: 'delivered', id },
    attributes: ['id', 'weight', 'final_amount', 'customer_name', 'shipping_carrier', 'shipping_partner_id', 'dispatch_date', 'country_id', 'payment_gateway_id'],
    include: [
      {
        model: ShipmentMail,
        attributes: ['condition', 'created_at', 'shipment_id'],
      },
      {
        model: ShippingPartner,
        attributes: ['name'],
        // where: { id: shippreId },
      },
      {
        model: Country,
        attributes: ['name'],
      },
      {
        model: PaymentGateway,
        attributes: ['name'],
      },
    ],
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
  };

  const shipments = await Shipment
    .findAll(shipOption);
  log(shipments);

  let dispatched = '';
  let delivered = '';
  let days = '';

  for (const shipment of shipments) {
    for (const shipmentsdate of shipment.shipmentMails) {
      if (shipmentsdate.condition === 'ship_dispatched') {
        dispatched = moment(shipmentsdate.created_at);
        log('dispatched', moment(dispatched, 'DD.MM.YYYY'));
      } else if (shipmentsdate.condition === 'ship_delivered') {
        delivered = moment(shipmentsdate.created_at);
        log('delivered', moment(delivered, 'DD.MM.YYYY'));
      }
    }
    days = delivered.diff(dispatched, 'days');
    log({ days });
  }

  log({ shipments });
  return res.json({
    shipments,
    days,
  });
};

