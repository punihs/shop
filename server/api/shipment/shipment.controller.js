const moment = require('moment');

const {
  Country, User, Shipment, Package, Address, PackageCharge,
  ShippingRate, Notification, ShipmentMeta,
} = require('../../conn/sqldb');
const ses = require('../../conn/ses');
const logger = require('../../components/logger');

exports.index = (req, res, next) => {
  const options = {};
  if (req.query.customer_id) { options.where = { customer_id: req.query.customer_id }; }
  if (req.query.state) { options.where = { status: req.query.state }; }

  return Shipment
    .findAll(options)
    .then(shipments => res.json(shipments))
    .catch(next);
};


exports.shipOrder = (req, res) => res.json({});

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
  const selectedType = weight <= 2 ? type : 'nondoc';
  let rate;
  if (weight <= 300) {
    rate = await ShippingRate.find({
      where: {
        country_id: countryId,
        item_type: selectedType,
        min: { $lt: weight },
        max: { $gte: weight },
      },
    });
  } else {
    rate = await ShippingRate.find({
      where: {
        country_id: countryId,
        item_type: selectedType,
        min: { $lt: weight },
        max: 0,
      },
    });
  }

  if (rate) {
    const amount = (rate.rate_type === 'fixed') ? rate.amount : rate.amount * weight;
    return amount;
  }

  return false;
};


const getEstimation = async (packageIds, countryId, userId) => {
  const packages = await Package.findAll({
    include: [PackageCharge],
    where: {
      user_id: userId,
      id: packageIds,
    },
  });

  const country = await Country.findById(countryId);

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

    let charge = pack.PackageCharge;
    const packageLevelCharges = charge.storage + charge.address + charge.handling + charge.pickup
      + charge.doc + charge.liquid + charge.basic_photo + charge.advance_photo
      + charge.split + charge.scan_doc;

    shipping.level += packageLevelCharges;

    charge = calcShipping(countryId, pack.weight, pack.type);

    if (charge) {
      shipping.sub_total += charge;
    }
  });

  shipping.discount = (country.discount / 100) * shipping.sub_total;
  let estimated = shipping.sub_total - shipping.discount;
  estimated += shipping.level;
  shipping.estimated = estimated;

  return shipping;
};

exports.create = async (req, res, next) => {
  const userId = req.user.id;
  const packageIds = req.body.package_ids;

  const address = await Address.findById(req.body.address_id);

  const shipping = getEstimation(packageIds, address.country_id, userId);

  const packages = await Package
    .findAll({
      where: {
        user_id: userId,
        status: 'ship',
        id: packageIds,
      },
      raw: true,
    });


  if (!packages.length) return res.status(400).json({ message: 'No Packages Found.' });
  let toAddress = address.line1;
  if (address.line2) toAddress = `, ${address.line2}`;

  toAddress += `, ${address.city}`;
  toAddress += `, ${address.state}`;
  toAddress += `, ${address.country}`;
  toAddress += ` - ${address.pincode}`;

  const shipment = {};
  shipment.user_id = userId;
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
  const sR = await Shipment
    .create(shipment)
    .catch(next);

  const notification = {};
  notification.user_id = userId;
  notification.action_type = 'shipment';
  notification.action_id = sR.id;
  notification.action_description = `New shipment request created - Order# ${sR.order_id}`;
  Notification.create(notification);

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

  let packageLevelCharges = sR.package_level_charges;

  packageLevelCharges += meta.repack_amt + meta.sticker_amt
    + meta.extrapack_amt + meta.original_amt + meta.giftwrap_amt
    + meta.giftnote_amt + meta.consolid_amt;

  packageLevelCharges += meta.liquid_amt;

  const updateShip = await Shipment.findById(sR.id);

  let { estimated } = updateShip;
  estimated -= sR.package_level_charges;
  estimated += packageLevelCharges;

  updateShip.packageLevelCharges = packageLevelCharges;
  updateShip.estimated = estimated;
  updateShip.update(updateShip);

  Package.update({
    status: 'processing',
  }, {
    where: { id: packageIds },
  });

  const user = await User.findById(userId);

  ses.sendTemplatedEmail({
    Source: 'support@shoppre.com',
    Destination: {
      ToAddresses: [user.email],
    },
    Template: 'shoppre',
    TemplateData: JSON.stringify({
      packages,
      address,
      ship_request: updateShip,
    }),
  }, (err, data) => {
    if (err) {
      logger.log('SES err', err);
      return err;
    }
    return logger.log('send', data);
  });

  return res.json(sR);
};
