const debug = require('debug');
const moment = require('moment');

const eventEmitter = require('../../conn/event');

const {
  Country, Shipment, Package, Address, PackageMeta, ShipmentMeta,
} = require('../../conn/sqldb');
const { SHIPPING_RATE } = require('../../config/environment');

const log = debug('s.shipment.controller');

exports.index = (req, res, next) => {
  const options = {
    limit: Number(req.query.limit) || 20,
    attributes: ['id', 'number_of_packages'],
  };
  if (req.query.customer_id) { options.where = { customer_id: req.query.customer_id }; }
  if (req.query.status) { options.where = { shipping_status: req.query.status }; }

  return Shipment
    .findAll(options)
    .then(shipments => res.json(shipments))
    .catch(next);
};


exports.show = (req, res) => Shipment.findById(req.params.id).then(shipment => res.json(shipment));

exports.unread = async (req, res) => {
  const { id } = req.params;
  const status = await Shipment.update({ admin_read: false }, { where: { id } });
  return res.json(status);
};

exports.update = async (req, res) => {
  // normal update
  // tracking update
  const { id } = req.params;
  const status = await Shipment.update(req.body, { where: { id } });
  return res.json(status);
};


exports.metaUpdate = async (req, res) => {
  // normal update
  // tracking update
  const { id } = req.params;
  const status = await ShipmentMeta.update(req.body, { where: { id } });
  return res.json(status);
};


exports.destroy = async (req, res) => {
  const { id } = req.params;
  const status = await Shipment.destroy({ where: { id } });
  return res.json(status);
};

const calcShipping = async (countryId, weight, type) => {
  const key = `${countryId}-${weight}-${type}`;
  log('calcShipping', key);
  return JSON.parse(SHIPPING_RATE)[key];
};


const getEstimation = async (packageIds, countryId, userId) => {
  const packages = await Package.findAll({
    include: [{
      model: PackageMeta,
    }],
    where: {
      customer_id: userId,
      id: packageIds,
    },
  });

  const country = await Country
    .findById(countryId, {
      attributes: ['discount_percentage'],
    });

  const shipping = {
    price: 0,
    weight: 0,
    sub_total: 0,
    estimated: 0,
    level: 0,
    count: packages.length,
  };

  packages.forEach((p) => {
    const pack = p.toJSON();
    shipping.price += pack.price;
    shipping.weight += pack.weight;

    const meta = pack.PackageMeta || {};

    const packageLevelCharges = meta.storage + meta.address + meta.handling + meta.pickup
      + meta.doc + meta.liquid + meta.basic_photo + meta.advance_photo
      + meta.split + meta.scan_doc;

    shipping.level += packageLevelCharges;

    const shippingCharge = calcShipping(countryId, pack.weight, pack.type);

    if (shippingCharge) {
      shipping.sub_total += shippingCharge;
    }
  });

  shipping.discount = (country.discount_percentage / 100) * shipping.sub_total;
  let estimated = shipping.sub_total - shipping.discount;
  estimated += shipping.level;
  shipping.estimated = estimated;

  return shipping;
};

const getAddress = (address) => {
  log('getAddress', address.toJSON());
  let toAddress = address.line1;
  if (address.line2) toAddress = `, ${address.line2}`;

  toAddress += `, ${address.city}`;
  toAddress += `, ${address.state}`;
  toAddress += `, ${address.country}`;
  toAddress += ` - ${address.pincode}`;
  return toAddress;
};

const getPackages = (userId, packageIds) => Package
  .findAll({
    where: {
      customer_id: userId,
      status: 'ship',
      id: packageIds,
    },
    raw: true,
  });

const saveShipment = ({
  userId, address, toAddress, shipping,
}) => {
  const shipment = {};
  shipment.customer_id = userId;
  shipment.full_name = address.first_name;
  shipment.address = toAddress;
  shipment.country = address.country_id;
  shipment.phone = `+${address.code}-${address.phone}`;
  shipment.count = shipping.count;
  shipment.weight = shipping.weight;
  shipment.value = shipping.price;
  shipment.discount = shipping.discount;
  shipment.package_level_charges = shipping.level;
  shipment.sub_total = shipping.sub_total;
  shipment.estimated = shipping.estimated;
  shipment.final_amount = 0;

  shipment.payment_gateway_name = 'pending';
  shipment.payment_status = 'pending';
  shipment.shipping_status = 'inreview';

  const orderId = `${moment().format('YYYYMMDDHHmmss')}-${userId}`;

  shipment.order_id = orderId;
  return Shipment
    .create(shipment);
};

const saveShipmentMeta = ({ req, sR, packageIds }) => {
  const meta = Object.assign({ shipment_id: sR.id }, req.body);
  meta.repack_amt = (req.repack === 1) ? 100.00 : 0;
  meta.sticker_amt = (req.sticker === 1) ? 0 : 0;
  meta.original_amt = 0;

  if (packageIds.length) {
    meta.consolid = '1';
    meta.consolid_amt = (packageIds.length - 1) * 100.00;
  }

  meta.giftwrap_amt = (req.gift_wrap === 1) ? 100.00 : 0;
  meta.giftnote_amt = (req.gift_note === 1) ? 50.00 : 0;

  meta.extrapack_amt = (req.extrapack === 1) ? 500.00 : 0;

  if (req.liquid === '1') {
    if (req.weight < 5) {
      meta.liquid_amt = 1150.00;
    }
    if (req.weight >= 5 && req.weight < 10
    ) {
      meta.liquid_amt = 1650.00;
    }
    if (req.weight >= 10 && req.weight < 15
    ) {
      meta.liquid_amt = 2750.00;
    }
    if (req.weight >= 15) {
      meta.liquid_amt = 3150.00;
    }
  }
  meta.profoma_taxid = req.invoice_taxid;
  meta.profoma_personal = req.invoice_personal;
  meta.invoice_include = req.invoice_include;
  return ShipmentMeta.create(meta);
};

const updateShipment = async ({ sR, shipmentMeta }) => {
  let packageLevelCharges = sR.package_level_charges;

  packageLevelCharges += shipmentMeta.repack_amt + shipmentMeta.sticker_amt
    + shipmentMeta.extrapack_amt + shipmentMeta.original_amt + shipmentMeta.giftwrap_amt
    + shipmentMeta.giftnote_amt + shipmentMeta.consolid_amt;

  packageLevelCharges += shipmentMeta.liquid_amt;

  const updateShip = await Shipment.findById(sR.id);

  let { estimated } = updateShip;
  estimated -= sR.package_level_charges;
  estimated += packageLevelCharges;

  updateShip.packageLevelCharges = packageLevelCharges;
  updateShip.estimated = estimated;
  return sR.update(updateShip);
};

const updatePackages = packageIds => Package.update({
  status: 'processing',
}, {
  where: { id: packageIds },
});


exports.create = async (req, res, next) => {
  log('shipment:create', req.body, { customerId: req.user.id });
  try {
    const { id: userId } = req.user;
    const { package_ids: packageIds } = req.body;
    const packages = await getPackages(userId, packageIds);

    if (!packages.length) return res.status(400).json({ message: 'No Packages Found.' });

    const address = await Address.findById(req.body.address_id);

    const toAddress = await getAddress(address);

    const shipping = await getEstimation(packageIds, address.country_id, userId);

    const sR = await saveShipment({
      userId, address, toAddress, shipping,
    });

    const shipmentMeta = await saveShipmentMeta({ req, sR, packageIds });

    const updateShip = await updateShipment({ shipmentMeta, sR });

    updatePackages(packageIds);

    eventEmitter.emit('shipment:create', {
      userId, sR, packages, address, updateShip,
    });

    return res.status(201).json(sR);
  } catch (e) {
    return next(e);
  }
};
