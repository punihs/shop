const debug = require('debug');
const moment = require('moment');

const {
  ShippingPartner, Shipment, PaymentGateway,
  Country, ShipmentMail,
} = require('../../../conn/sqldb');

const log = debug('s.shipment.controller');

const attributes = [
  'id', 'weight', 'final_amount', 'customer_name', 'shipping_carrier', 'dispatch_date',
  'country_id', 'payment_gateway_id',
];

const shippingPartner = {
  model: ShippingPartner,
  attributes: ['name'],
};

const include = [{
  model: ShipmentMail,
  attributes: ['condition', 'created_at'],
  where: {
    condition: ['ship_dispatched', 'ship_delivered'],
  },
}, {
  model: Country,
  attributes: ['name'],
}, {
  model: PaymentGateway,
  attributes: ['name'],
}];

exports.index = async (req, res) => {
  const { slug } = req.params;
  log({ slug });

  return Shipment
    .findAll({
      where: { status: 'delivered' },
      attributes,
      include: [shippingPartner].concat(include),
      limit: Number(req.query.limit) || 20,
      offset: Number(req.query.offset) || 0,
    })
    .then(shipments => res.json(shipments.map((shipment) => {
      const [dispatched, delivered] = shipment.shipmentMails;

      return {
        ...shipment,
        days: moment(delivered.created_at).diff(dispatched.created_at, 'days')
      };
    })));
};

exports.show = async (req, res) => {
  const { id } = req.params;
  log({ id });

  return Shipment
    .find({
      attributes,
      include: [shippingPartner].concat(include),
      where: { status: 'delivered', id },
    })
    .then((shipment) => {
      const [dispatched, delivered] = shipment.shipmentMails.name;

      return res.json({
        ...shipment,
        days: moment(delivered.created_at).diff(dispatched.created_at, 'days'),
      });
    });
};
