const debug = require('debug');
const moment = require('moment');
const _ = require('lodash');
const xlsx = require('node-xlsx');

const logger = require('../../components/logger');

const eventEmitter = require('../../conn/event');

const db = require('../../conn/sqldb');
const shipper = require('../../conn/shipper');
const { stringify } = require('querystring');

const {
  Country, Shipment, Package, Address, PackageCharge, ShipmentMeta, Notification,
  PackageState, User, Locker,
  ShipmentState, Store, ShipmentType, DHLLog,
  PackageItem, PhotoRequest, ShippingRate, PaymentGateway,
} = db;

const {
  SHIPMENT_STATE_ID_NAMES,
  SHIPMENT_STATE_IDS: {
    SHIPMENT_HANDED, PACKAGING_REQUESTED,
    PAYMENT_COMPLETED, PAYMENT_FAILED, PAYMENT_REQUESTED, PAYMENT_CONFIRMED,
    SHIPMENT_CANCELLED, UPSTREAM_SHIPMENT_REQUEST_CREATED,
    SHIPMENT_MANUAL_FOLLOW_UP, SHIPMENT_LOST, CUSTOM_ON_HOLD, WRONG_ADDRESS,
    RTO_REQUESTED, RAISE_SHIPMENT_LOST_CLAIM, PENALTY_PAYMENT_REQUESTED,
    PENALTY_PAYMENT_DONE, WRONG_ADDRESS_FOLLOW_UP, CLAIM_PROCESSED_TO_CUSTOMER,
    SHIPMENT_DELIVERED, SHIPMENT_DELETED, SHIPMENT_REJECTED_BY_CUSTOMER, RETURN_TO_ORIGIN,
    CUSTOMER_ACKNOWLEDGEMENT_RECEIVED, AMOUNT_RECEIVED_FROM_UPSTREAM,
  },
  SHIPMENT_HISTORY,
  PACKAGE_STATE_IDS: { READY_TO_SHIP },
  GROUPS: { CUSTOMER },
  PAYMENT_GATEWAY: { WALLET, WIRE, CASH },
} = require('../../config/constants');
const { URLS_LOGISTICS } = require('../../config/environment');

const BUCKETS = require('../../config/constants/buckets');

const { ADDED_TO_SHIPMENT } = require('../../config/constants/packageStates');

const log = debug('s.shipment.controller');
const { index, show } = require('./shipment.service');

exports.index = (req, res, next) => index(req)
  .then((result) => {
    if (req.query.xlsx) {
      const header = [
        'id', 'Store Name', 'Virtual Address Code', 'Status',
      ];
      const excel = xlsx.build([{
        name: 'Shipments',
        data: [header]
          .concat(result
            .Shipments
            .map(({
              id,
              Store: store,
              Customer,
              ShipmentState: shipmentState,
            }) => [
              id, store.name, Customer.virtual_address_code,
              SHIPMENT_STATE_ID_NAMES[shipmentState.state_id],
            ])),
      }]);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats');
      res.setHeader(
        'Content-disposition',
        `attachment; filename=Packages_${moment()
          .format('DD-MM-YYYY')}.xlsx`,
      );

      return res.end(excel, 'binary');
    }
    log({ result });
    return res.json(result);
  })
  .catch(next);

exports.show = async (req, res, next) => {
  if (req.user.group_id === CUSTOMER) {
    return show(req, res);
  }

  log('show', req.query);
  return Shipment
    .findById(req.params.id, {
      attributes: req.query.fl
        ? req.query.fl.split(',')
        : ['id', 'customer_id', 'created_at', 'weight', 'final_weight', 'packages_count',
          'pick_up_charge_amount', 'payment_gateway_fee_amount', 'final_amount'],
      include: [{
        model: ShipmentState,
        attributes: ['id', 'state_id'],
        required: false,
      }, {
        model: ShipmentType,
        attributes: ['id', 'name'],
      }, {
        model: ShipmentMeta,
        attributes: ['sticker_charge_amount', 'original', 'mark_personal_use', 'invoice_tax_id', 'repacking_charge_amount', 'extra_packing_charge_amount', 'original_ship_box_charge__amount',
          'consolidation_charge_amount', 'gift_wrap_charge_amount', 'gift_note_charge_amount', 'gift_note_text',
          'insurance_amount', 'liquid_charge_amount', 'overweight_charge_amount'],
      }, {
        attributes: ['id', 'weight', 'package_state_id', 'price_amount'],
        model: Package,
        include: [{
          model: Store,
          attributes: ['name'],
        }],
      }, {
        model: User,
        as: 'Customer',
        attributes: [
          'id', 'name', 'first_name', 'last_name', 'salutation', 'virtual_address_code',
          'phone', 'email',
        ],
        include: [{
          model: Country,
          attributes: ['id', 'name', 'iso2'],
        }, {
          model: Locker,
          attributes: ['id', 'name', 'short_name', 'allocated_at'],
        }],
      }, {
        model: Country,
        attributes: ['id', 'name', 'iso2', 'iso3'],
      },
        // , {
      //   model: PaymentGateway,
      //   attributes: ['id', 'value'],
      // }
      {
        model: Address,
        attributes: [
          'id', 'city', 'name', 'salutation', 'first_name', 'last_name',
          'phone',
        ],
      }],
    })
    .then((shipment) => {
      if (!shipment) return res.status(404).end();

      return res.json({
        ...shipment.toJSON(),
        state_id: shipment.ShipmentState && shipment.ShipmentState.state_id,
      });
    })
    .catch(next);
};

exports.status = async (req, res, next) => Shipment
  .findById(req.params.id, {
    attributes: ['shipping_partner_id', 'tracking_code'],
    raw: true,
  })
  .then((shipment) => {
    log('status:shipment', shipment);
    return shipper[shipment.shipping_partner_id]
      .status(shipment.tracking_code)
      .then((result) => {
        log('result', result);
        return res
          .json({
            shipper: shipment.shipping_partner_id,
            result,
          });
      });
  })
  .catch(next);

exports.unread = async (req, res) => {
  const { id } = req.params;
  const status = await Shipment.update({ admin_read: false }, { where: { id } });
  return res.json(status);
};

exports.update = async (req, res) => {
  const { id } = req.params;

  const shipmentMeta = await Shipment
    .find({
      attributes: ['package_level_charges_amount'],
      where: { id },
      include: [{
        model: ShipmentMeta,
        attributes: ['liquid_charge_amount', 'overweight_charge_amount', 'is_liquid'],
      }],
    });
  const updateShipment = req.body;
  const updateMeta = {};

  let packageLevelCharges = shipmentMeta.package_level_charges_amount;
  log('liquid', shipmentMeta);

  if (shipmentMeta.ShipmentMetum.is_liquid === 1) {
    packageLevelCharges -= shipmentMeta.ShipmentMetum.liquid_charge_amount || 0;
    log('weight', req.body.weight);
    log({ packageLevelCharges });
    updateMeta.liquid_charge_amount = req.body.liquid_charge_amount;
  }
  if (shipmentMeta.ShipmentMetum.overweight === '1') {
    packageLevelCharges -= shipmentMeta.ShipmentMetum.overweight_charge_amount || 0;
    if (req.body.weight > 30) {
      updateMeta.overweight_charge_amount = 2500.00;
    } else {
      updateMeta.overweight = '0';
      updateMeta.overweight_charge_amount = 0;
    }
  } else if (req.body.weight > 30) {
    updateMeta.overweight = '1';
    updateMeta.overweight_charge_amount = 2500.00;
  } else {
    updateMeta.overweight = '0';
    updateMeta.overweight_charge_amount = 0;
  }
  log('updateMeta', JSON.stringify(updateMeta));
  await ShipmentMeta.update(updateMeta, { where: { id } });
  packageLevelCharges = Number(packageLevelCharges);
  packageLevelCharges += Number(updateMeta.liquid_charge_amount) || 0;
  packageLevelCharges += Number(updateMeta.overweight_charge_amount) || 0;
  updateShipment.package_level_charges_amount = packageLevelCharges;

  const subTotalAmount = req.body.sub_total_amount;
  const discountAmount = req.body.discount_amount;
  const pickUpChargeAmount = req.body.pick_up_charge_amount || 0;
  const estimatedAmount =
    (subTotalAmount - discountAmount) + packageLevelCharges + pickUpChargeAmount;
  log(subTotalAmount, discountAmount, packageLevelCharges, pickUpChargeAmount);
  updateShipment.sub_total_amount = subTotalAmount;
  updateShipment.discount_amount = discountAmount;
  updateShipment.estimated_amount = estimatedAmount;
  const status = await Shipment.update(updateShipment, { where: { id } });

  // const status = await Shipment.update(req.body, { where: { id } });
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
  try {
    const { id } = req.params;

    const shipment = await Shipment
      .find({
        where: { id },
        include: [{
          model: ShipmentState,
          attributes: ['id', 'state_id'],
        }],
      });

    if ([PAYMENT_CONFIRMED,
      UPSTREAM_SHIPMENT_REQUEST_CREATED,
      SHIPMENT_HANDED,
      SHIPMENT_MANUAL_FOLLOW_UP,
      SHIPMENT_LOST,
      CUSTOM_ON_HOLD,
      WRONG_ADDRESS,
      SHIPMENT_REJECTED_BY_CUSTOMER,
      RTO_REQUESTED,
      RAISE_SHIPMENT_LOST_CLAIM,
      PENALTY_PAYMENT_REQUESTED,
      RETURN_TO_ORIGIN,
      AMOUNT_RECEIVED_FROM_UPSTREAM,
      PENALTY_PAYMENT_DONE,
      WRONG_ADDRESS_FOLLOW_UP,
      CLAIM_PROCESSED_TO_CUSTOMER,
      CUSTOMER_ACKNOWLEDGEMENT_RECEIVED,
      SHIPMENT_DELIVERED,
      SHIPMENT_CANCELLED].includes(shipment.ShipmentState.state_id)) {
      return res.json({ message: 'Can not delete shipment after payment confirm' });
    }

    const pkg = await Package
      .findAll({
        where: { shipment_id: shipment.id },
      });
    log('pkg id', JSON.stringify(pkg));

    await pkg
      .map(packageId => Package
        .updateState({
          db,
          lastStateId: null,
          nextStateId: READY_TO_SHIP,
          pkg: packageId,
          actingUser: req.user,
        }));

    await ShipmentMeta
      .destroy({ where: { shipment_id: id } });

    await Shipment
      .updateShipmentState({
        db,
        shipment,
        actingUser: req.user,
        nextStateId: SHIPMENT_DELETED,
        comments: 'Shipment Deleted By OPS',
      });
    await Package
      .update({ shipment_id: null }, { where: { shipment_id: id } });

    return res.json({ message: 'Shipment Deleted' });
  } catch (e) {
    return logger.error('error shipment deletion', e);
  }
};

const calcShipping = async (countryId, weight, type) => {
  const docType = weight <= 2 ? type : 'nondoc';
  let rate = '';
  const optionsRate = {
    attributes: ['amount'],
    where: {
      country_id: countryId,
      consignment_type: docType,
      minimum: {
        $lt: weight,
      },
    },
  };
  if (weight <= 300) {
    optionsRate.where.maximum = {
      $gte: weight,
    };
  } else {
    optionsRate.where.max = 0;
  }
  log('optionsRate', JSON.stringify(optionsRate));
  rate = await ShippingRate
    .find(optionsRate);
  log('rate', rate);
  if (rate) {
    const amount = (rate.rate_type === 'fixed') ? rate.amount : rate.amount * weight;
    log('-----------amount', amount);
    return amount;
  }
  return false;
};

const getEstimation = async (packageIds, countryId, userId) => {
  const packages = await Package.findAll({
    include: [{
      attributes: ['storage_amount', 'wrong_address_amount', 'special_handling_amount', 'receive_mail_amount',
        'pickup_amount', 'standard_photo_amount', 'advanced_photo_amount', 'split_package_amount',
        'scan_document_amount'],
      model: PackageCharge,
    }],
    where: {
      customer_id: userId,
      id: packageIds,
    },
  });
  log('packages', JSON.stringify(packages));

  const country = await Country
    .findById(countryId, {
      attributes: ['discount_percentage'],
    });

  const shipping = {
    price: 0,
    weight: 0,
    sub_total_amount: 0,
    estimated: 0,
    level: 0,
    count: packages.length,
  };
  log({ shipping });
  // packages.forEach((p) => {
  let packItem = '';
  // eslint-disable-next-line no-restricted-syntax
  for (packItem of packages) {
    const pack = packItem.toJSON();
    shipping.price += pack.price_amount;
    shipping.weight += pack.weight;

    const packageCharge = pack.PackageCharge || {};
    log({ packageCharge });

    const keys = [
      'storage_amount', 'wrong_address_amount', 'special_handling_amount', 'receive_mail_amount',
      'pickup_amount', 'standard_photo_amount', 'advanced_photo_amount', 'split_package_amount',
      'scan_document_amount',
    ];
    let type = '';
    type = pack.content_type === 1 ? 'doc' : 'nondoc';
    type = type === 'doc' ? 1 : 2;

    shipping.level += keys.reduce((nxt, key) => (nxt + (packageCharge[key] || 0)), 0);
    log('data', countryId, pack.weight, type);

    // eslint-disable-next-line no-await-in-loop
    const shippingCharge = await calcShipping(countryId, pack.weight, type);
    log('shippingCharge', shippingCharge);

    if (shippingCharge) {
      shipping.sub_total_amount = shippingCharge;
      log('shippingCharge', shippingCharge);
    }
  }
  shipping.discount = (country.discount_percentage / 100) * shipping.sub_total_amount;
  let estimated = shipping.sub_total_amount - shipping.discount;
  estimated += shipping.level;
  shipping.estimated = estimated;

  return shipping;
};

const getAddress = (address) => {
  log('getAddress', address.toJSON());

  let toAddress = address.line1;
  if (address.line2) toAddress += `, ${address.line2}`;

  toAddress += `, ${address.city}`;
  toAddress += `, ${address.state}`;
  toAddress += `, ${address.Country.name}`;
  if (address.pincode) toAddress += `, ${address.pincode}`;
  return toAddress;
};

const getPackages = (userId, packageIds) => Package
  .findAll({
    attributes: ['id', 'package_state_id'],
    where: {
      customer_id: userId,
      id: packageIds,
    },
    include: [{
      attributes: ['id', 'package_id'],
      model: PackageState,
      where: {
        state_id: [READY_TO_SHIP],
      },
    }],
  });

const saveShipment = ({
  userId, address, toAddress, shipping,
}) => {
  const shipment = {};
  log({ address });
  shipment.customer_id = userId;
  shipment.customer_name = `${address.first_name} ${address.last_name}`;
  shipment.address = toAddress;
  shipment.address_id = address.id;
  shipment.country_id = address.country_id;
  shipment.phone = address.phone;
  shipment.packages_count = shipping.count;
  shipment.weight = shipping.weight;
  shipment.final_weight = shipping.weight;
  shipment.value_amount = shipping.price;
  shipment.discount_amount = shipping.discount;
  shipment.package_level_charges_amount = shipping.level;
  shipment.sub_total_amount = shipping.sub_total_amount;
  shipment.estimated_amount = shipping.estimated;
  shipment.final_amount = 0;

  shipment.payment_gateway_name = 'pending';
  shipment.payment_status = 'pending';
  shipment.status = 'inreview';

  const orderCode = `${moment().format('YYYYMMDDHHmmss')}-${userId}`;

  shipment.order_code = orderCode;
  log({ shipment });
  // log({ shipment });
  return Shipment
    .create(shipment);
};

const saveShipmentMeta = ({ req, sR, packageIds }) => {
  log({ sR });
  const meta = Object.assign({ shipment_id: sR.id }, req.body);
  meta.repacking_charge_amount = (req.body.repack === true) ? 100.00 : 0;
  meta.sticker_charge_amount = (req.body.sticker === true) ? 0 : 0;
  meta.sticker_charge_amount = 0;

  if (packageIds.length > 1) {
    meta.consolidation = true;
    meta.consolidation_charge_amount = (packageIds.length - 1) * 100.00;
  }

  meta.gift_wrap_charge_amount = (req.body.gift_wrap === true) ? 100.00 : 0;
  meta.gift_note_charge_amount = (req.body.gift_note === true) ? 50.00 : 0;

  meta.extra_packing_charge_amount = (req.body.extra_packing === true) ? 500.00 : 0;

  if (req.body.is_liquid === true) {
    log('liquid true', JSON.stringify(req.body));
    if (sR.weight < 5) {
      meta.liquid_charge_amount = 1392.40;
    }
    if (sR.weight >= 5 && req.body.weight < 10
    ) {
      meta.liquid_charge_amount = 3009.00;
    }
    if (sR.weight >= 10 && req.body.weight < 15
    ) {
      meta.liquid_charge_amount = 5369.00;
    }
    if (sR.weight >= 15) {
      meta.liquid_charge_amount = 7729.00;
    }
  }

  meta.invoice_tax_id = req.body.invoice_tax_id;
  meta.mark_personal_use = req.body.mark_personal_use;
  meta.invoice_include = req.body.invoice_include;
  meta.original_ship_box_charge__amount = 0;
  meta.max_weight = req.body.max_weight;
  meta.id = sR.id;
  log({ meta });
  log('body JSON', JSON.stringify(req.body));
  return ShipmentMeta.create(meta);
};

const updateShipment = async ({ shipmentMeta, sR }) => {
  let packageLevelCharges = sR.package_level_charges_amount;
  log('SR1', (sR));
  log('packageLevelCharges', (packageLevelCharges));
  log('repacking_charge_amount', (shipmentMeta.repacking_charge_amount));
  log('sticker_charge_amount', (shipmentMeta.sticker_charge_amount));
  log('extra_packing_charge_amount', (shipmentMeta.extra_packing_charge_amount));
  log('original_ship_box_charge__amount', (shipmentMeta.original_ship_box_charge__amount));
  log('gift_wrap_charge_amount', (shipmentMeta.gift_wrap_charge_amount));
  log('gift_note_charge_amount', (shipmentMeta.gift_note_charge_amount));
  log('consolidation_charge_amount', (shipmentMeta.consolidation_charge_amount));
  log('liquid_charge_amount', (shipmentMeta.liquid_charge_amount));
  let totalPackageCharges = shipmentMeta.repacking_charge_amount || 0;
  totalPackageCharges += shipmentMeta.sticker_charge_amount || 0;
  totalPackageCharges += shipmentMeta.extra_packing_charge_amount || 0;
  totalPackageCharges += shipmentMeta.original_ship_box_charge__amount || 0;
  totalPackageCharges += shipmentMeta.gift_wrap_charge_amount || 0;
  totalPackageCharges += shipmentMeta.gift_note_charge_amount || 0;
  totalPackageCharges += shipmentMeta.consolidation_charge_amount || 0;
  log('totalPackageCharges', (totalPackageCharges));
  packageLevelCharges += totalPackageCharges;

  packageLevelCharges += shipmentMeta.liquid_charge_amount || 0;
  log('shipmentMeta.liquid_charge_amount end', (shipmentMeta.liquid_charge_amount));

  const updateShip = await Shipment.findById(sR.id);
  const shipmentUpdate = [];

  let estimatedAmount = updateShip.estimated_amount;
  estimatedAmount -= sR.package_level_charges_amount;
  estimatedAmount += packageLevelCharges;
  log({ estimatedAmount });

  log('sR.package_level_charges_amount', (sR.package_level_charges_amount));

  shipmentUpdate.package_level_charges_amount = packageLevelCharges;
  log('packageLevelCharges123', (packageLevelCharges));
  shipmentUpdate.estimated_amount = estimatedAmount;
  log('updateShip', JSON.stringify(updateShip));
  const shipdata = await Shipment.find({ where: { id: sR.id } });
  log('shipdata', JSON.stringify(shipdata));
  Shipment.update({
    package_level_charges_amount: shipmentUpdate.package_level_charges_amount,
    estimated_amount: shipmentUpdate.estimated_amount,
  }, { where: { id: sR.id } });
  return Shipment.findById(sR.id);
};

const updatePackages = (shipmentId, packageIds, actingUser) => {
  log({ packageIds });
  packageIds.map(id => Package.updateState({
    db,
    nextStateId: ADDED_TO_SHIPMENT,
    pkg: { id },
    actingUser,
  }));
  return Package.update({
    shipment_id: shipmentId,
  }, {
    where: { id: packageIds },
  });
};


exports.create = async (req, res, next) => {
  log('shipment:create', req.body, { customerId: req.user.id });
  try {
    const { id: userId } = req.user;
    const packageIds = req.query.package_ids.split(',');
    const packages = await getPackages(userId, packageIds);

    if (!packages.length) return res.status(400).json({ message: 'No Packages Found.' });
    log('addressid', req.body.address_id);
    const address = await Address.find({
      attributes: ['salutation', 'first_name', 'last_name', 'line1', 'line2', 'state',
        'city', 'pincode', 'phone', 'email', 'country_id'],
      where: { id: req.body.address_id },
      include: [{
        model: Country,
        attributes: ['name'],
      }],
    });

    const toAddress = await getAddress(address);

    const shipping = await getEstimation(packageIds, address.country_id, userId);
    log('shipping', JSON.stringify(shipping));
    const sR = await saveShipment({
      userId, address, toAddress, shipping,
    });
    log('sR saveShipment', JSON.stringify(sR));
    const shipmentMeta = await saveShipmentMeta({ req, sR, packageIds });
    log('shipmentMeta saveShipmentMeta', JSON.stringify(shipmentMeta));
    const updateShip = await updateShipment({ shipmentMeta, sR });
    log('packageIds', packageIds);
    log('updateShip123', updateShip);
    log('sR', sR.id);
    updatePackages(sR.id, packageIds, req.user);

    await Shipment.updateShipmentState({
      db,
      nextStateId: PACKAGING_REQUESTED,
      shipment: sR,
      actingUser: req.user,
    });

    eventEmitter.emit('shipment:create', {
      userId, sR, packages, address, updateShip,
    });

    return res.status(201).json(sR);
  } catch (e) {
    return next(e);
  }
};


exports.shipQueue = async (req, res) => {
  const options = {
    attributes: [
      'id', 'order_code', 'customer_name', 'address',
      'phone', 'packages_count', 'final_weight', 'wallet_amount', 'package_level_charges_amount',
      'coupon_amount', 'loyalty_amount', 'estimated_amount', 'created_at', 'payment_status',
      'final_amount', 'payment_gateway_fee_amount',
    ],
    where: { customer_id: req.user.id },
    include: [{
      model: ShipmentState,
      attributes: ['state_id'],
      where: {
        state_id: [PACKAGING_REQUESTED, PAYMENT_REQUESTED,
          PAYMENT_COMPLETED, PAYMENT_FAILED, PAYMENT_CONFIRMED, UPSTREAM_SHIPMENT_REQUEST_CREATED],
      },
    }, {
      model: Package,
      attributes: ['id', 'created_at', 'weight', 'price_amount'],
      include: [{
        model: PackageItem,
        attributes: ['id', 'quantity', 'price_amount', 'total_amount', 'object', 'name'],
      }, {
        model: Store,
        attributes: ['id', 'name'],
      }],
    }],
    order: [['updated_at', 'desc']],
  };
  await Shipment
    .findAll(options)
    .then((shipment) => {
      log(shipment);
      res.json({ shipment });
    });
};

exports.count = async (req, res) => {
  const buckets = BUCKETS.SHIPMENT;
  return Shipment
    .count({
      where: {
        customer_id: req.user.id,
      },
      include: [{
        model: ShipmentState,
        where: {
          state_id: buckets[req.user.group_id][req.query.bucket || 'IN_QUEUE'],
        },
      }],
    })
    .then(count => res.json(count));
};

exports.history = (req, res) => {
  const options = {
    attributes: [
      'id', 'order_code', 'customer_name', 'address',
      'phone', 'packages_count', 'final_weight', 'wallet_amount', 'package_level_charges_amount',
      'coupon_amount', 'loyalty_amount', 'estimated_amount', 'created_at', 'payment_status',
      'final_amount', 'payment_gateway_fee_amount', 'tracking_code', 'tracking_url',
      'number_of_packages', 'weight_by_shipping_partner', 'value_by_shipping_partner', 'shipping_carrier',
    ],
    where: { customer_id: req.user.id },
    include: [{
      model: Package,
      attributes: ['id', 'created_at', 'weight', 'price_amount'],
      include: [{
        model: PackageItem,
        attributes: ['name', 'quantity', 'price_amount', 'object_advanced', 'object'],
      }, {
        model: PhotoRequest,
        attributes: ['id', 'type'],
      }, {
        model: Store,
        attributes: ['id', 'name'],
      }],
    }, {
      model: User,
      as: 'Customer',
      attributes: ['id'],
      include: [{
        model: Country,
        attributes: ['iso2'],
      }],
    }, {
      model: ShipmentState,
      attributes: ['state_id'],
      where: {
        state_id: SHIPMENT_HISTORY,
      },
    }, {
      model: PaymentGateway,
      attributes: ['id', 'name', 'value'],
    }],
    order: [['updated_at', 'desc']],
  };

  Shipment
    .findAll(options)
    .then((shipment) => {
      log(shipment);
      res.json({ shipment });
    });
};

exports.cancelRequest = async (req, res, next) => {
  const { id: customerId } = req.user;
  const { id: shipmentId } = req.params;
  return Shipment
    .find({
      attributes: ['id', 'created_at', 'order_code'],
      where: {
        customer_id: customerId,
        id: shipmentId,
      },
      include: [{
        model: ShipmentState,
        attributes: ['id'],
        where: { state_id: PACKAGING_REQUESTED },
      }],
    })
    .then((shipment) => {
      if (!shipment) return res.status(400).json({ message: 'requested shipment not exist' });

      const CANCELLATION_TIME = moment(shipment.created_at).diff(moment(), 'hours');

      if (CANCELLATION_TIME > 1) {
        const message = 'You can not cancel shipment after 1 hour from shipment creation. ' +
          `creation Time Gap: ${CANCELLATION_TIME}`;
        return res
          .status(400)
          .json({ message });
      }

      return Promise
        .all([
          Shipment
            .updateShipmentState({
              db,
              shipment,
              actingUser: req.user,
              nextStateId: SHIPMENT_CANCELLED,
              comments: 'Shipment Cancelled By Customer',
            }),

          Notification.create({
            customer_id: customerId,
            action_type: 'shipment',
            action_id: shipment.id,
            action_description: `Shipment request cancelled - Order#  ${shipment.order_code}`,
          }),
        ])
        .then(() => res.json({ message: 'Ship request has been cancelled!', shipment }));
    })
    .catch(next);
};

exports.invoice = async (req, res) => {
  const { orderCode } = req.params;
  let packages;
  const options = {
    where: { order_code: orderCode },
    include: [{
      model: User,
      as: 'Customer',
      attributes: ['first_name', 'last_name'],
    }, {
      model: ShipmentMeta,
    }, {
      model: Package,
      include: [{
        model: PackageItem,
        attributes: ['id', 'quantity', 'price_amount', 'total_amount', 'object', 'name'],
      }, {
        model: Store,
        attributes: ['id', 'name'],
      }, {
        model: PackageCharge,
      }],
    }],
  };
  const shipment = await Shipment
    .find(options);
  if (shipment) {
    packages = await Package
      .findAll({ where: { shipment_id: shipment.id } });
  }
  return res.json({ packages, shipment });
};

exports.finalShipRequest = async (req, res) => {
  const customerId = req.user.id;
  const id = req.body.shipment_id;
  log('body', JSON.stringify(req.body));

  const shipment = await Shipment
    .find({
      attributes: ['id', 'customer_id', 'estimated_amount', 'order_code', 'final_amount'],
      where: { id, customer_id: customerId },
    });

  if (!shipment) return res.status(400).json({ message: 'shipment not found' });

  log('shipment.wallet_amount', shipment.wallet_amount);


  const notification = {};
  notification.customer_id = customerId;
  notification.action_type = 'shipment';
  notification.action_id = shipment.id;

  await Notification.create({
    customer_id: customerId,
    action_type: 'shipment',
    action_id: shipment.id,
    action_description: `Customer submitted payment - Order#  ${shipment.order_code}`,
  });

  log('shipment', shipment);
  log('ship_request_id', shipment.id);
  log('shipment', JSON.stringify(shipment));

  const url = 'http://pay.shoppre.test/api/transactions/create?';
  const e = shipment.estimated_amount;
  const pg = req.body.payment_gateway_id;
  return res.redirect(`${url}object_id=${shipment.id}&uid=${req.user.id}&estimated=${e}&payment_gateway_id=${pg}`);
};

exports.createShipment = async (req, res, IsShippingAddress) => {
  const customerId = req.user.id;
  log('createShipment.customerId', customerId);
  log('req.user.package_ids', req.query.packageIds);

  if (!req.user.package_ids) {
    log('createshipments-package-ids', req.user.ids);
    res.status(400).json({ message: 'package is not found' });
  }
  log('req.query;', req.query);

  const { packageIds } = req.query;
  const { IS_LIQUID } = req.user;
  const optionPackage = {
    attributes: ['id', 'weight', 'invoice_code', 'price_amount'],
    where: { customer_id: customerId, id: packageIds.split(',') },
    include: [{
      model: PackageCharge,
      attributes: ['storage_amount', 'wrong_address_amount', 'special_handling_amount',
        'receive_mail_amount', 'pickup_amount', 'standard_photo_amount',
        'advanced_photo_amount', 'split_package_amount', 'scan_document_amount'],
    }, {
      model: Store,
      attributes: ['name'],
    }, {
      model: PhotoRequest,
      attributes: ['id', 'status'],
    }, {
      model: PackageItem,
      attributes: ['name', 'quantity', 'price_amount', 'object', 'object_advanced'],
    }],
  };

  const packages = await Package
    .findAll(optionPackage);

  let consolidationChargesAmount = 0;
  if (!packages) {
    res.redirect('customer.locker').status(400).json({ message: 'package not found' });
  }
  log('packageIds.split ', packageIds.split(',').length);
  if (packageIds.split(',').length > 1) {
    consolidationChargesAmount = (packageIds.split(',').length - 1) * 100.00;
  }
  const shipmentMeta = {
    storage_amount: 0,
    photo_amount: 0,
    pickup_amount: 0,
    special_handling_amount: 0,
    receive_mail_amount: 0,
    split_package_amount: 0,
    wrong_address_amount: 0,
    consolidation_charge_amount: consolidationChargesAmount,
    optsAmount: 0,
    scan_document_amount: 0,
  };
  log({ shipmentMeta });
  log('packages123 ', JSON.stringify(packages));
  packages.forEach((pack) => {
    log('pack', JSON.stringify(pack));
    shipmentMeta.storage_amount += pack.PackageCharge.storage_amount || 0;
    shipmentMeta.photo_amount += pack.PackageCharge.standard_photo_amount || 0;
    shipmentMeta.photo_amount += pack.PackageCharge.advanced_photo_amount || 0;
    shipmentMeta.pickup_amount += pack.PackageCharge.pickup_amount || 0;
    shipmentMeta.special_handling_amount += pack.PackageCharge.special_handling_amount || 0;
    shipmentMeta.receive_mail_amount += pack.PackageCharge.receive_mail_amount || 0;
    shipmentMeta.split_package_amount += pack.PackageCharge.split_package_amount || 0;
    shipmentMeta.wrong_address_amount += pack.PackageCharge.wrong_address_amount || 0;
    shipmentMeta.scan_document_amount += pack.PackageCharge.scan_document_amount || 0;
    log('adding package charges', shipmentMeta);
  });
  log('charges', shipmentMeta);

  const optionsCustomer = {
    attributes: ['id', 'salutation', 'first_name', 'last_name', 'email',
      'virtual_address_code', 'wallet_balance_amount'],
    where: { id: customerId },
    include: [{
      model: Address,
      attributes: ['id', 'salutation', 'first_name',
        'last_name', 'line1', 'line2', 'state', 'customer_id', 'is_default', 'city', 'pincode', 'phone', 'country_id'],
      include: [{
        model: Country,
        attributes: ['name'],
      }],
    }],
    limit: Number(req.query.limit) || 20,
  };

  const customer = await User
    .find(optionsCustomer);

  log(JSON.stringify(shipmentMeta));
  return res.json({
    customer, packages, shipmentMeta, IS_LIQUID, IsShippingAddress,
  });
};

const FREE_STORAGE_LIMIT_DAYS = 20;
const PACKAGE_CHARGES = {
  DAILY_AFTER_LIMITED_DAYS: 100,
};
const SPECIAL = '2';
const NORMAL = '1';

exports.redirectShipment = async (req, res) => {
  const customerId = req.user.id;
  const { packageIds } = req.query;
  log({ packageIds });
  const packages = await Package
    .findAll({
      attributes: ['id', 'content_type', 'created_at'],
      where: {
        id: packageIds.split(','),
        customer_id: customerId,
      },
      include: [{
        model: PackageState,
        attributes: [],
        where: {
          state_id: [READY_TO_SHIP],
        },
      }],
    });

  if (!packages.length) return res.status(400).json({ error: 'package not found' });

  const contentTypesMap = {
    [NORMAL]: [],
    [SPECIAL]: [],
  };

  const contentTypes = _.uniq(packages.map((pack) => {
    // - Information of multiple types of content - for Bad Request
    contentTypesMap[pack.content_type].push(pack);

    // Validate packages belongs to only one content type is request
    return pack.content_type;
  }));

  if (contentTypes.length !== 1) {
    log('Packages containing special items must be chosen and shipped separately.');
    log('contentTypess', (contentTypes));
    log('length', (contentTypes.length));
    return res
      .status(400)
      .json({
        message: 'Packages containing special items must be chosen and shipped separately.',
        contentTypesMap,
      });
  }

  packages.map((pack) => {
    // - Calculate Package Charges if exceed  minimum storage limit days
    const expiryDate = moment(pack.created_at).add(20, 'days');
    const today = moment();

    if (!today.isAfter(expiryDate)) return Promise.resolve();

    const totalDaysInStorage = today.diff(pack.created_at, 'days');
    const extraDays = totalDaysInStorage - FREE_STORAGE_LIMIT_DAYS;
    const storageCharge = extraDays * PACKAGE_CHARGES.DAILY_AFTER_LIMITED_DAYS;
    return PackageCharge
      .update(
        { storage_amount: storageCharge },
        { where: { id: pack.id } },
      );
  });

  let IS_LIQUID = !!contentTypesMap[SPECIAL].length;

  IS_LIQUID = IS_LIQUID === true ? 'To Be Calculated' : '0';

  let address = '';
  let IsShippingAddress = true;
  log({ customerId });
  if (req.body.addressId) {
    address = await Address
      .findById(req.body.addressId);
    if (address) {
      const optionAddress = {
        attributes: ['id'],
        where: { customer_id: customerId, is_default: 1 },
      };
      address = await Address
        .find(optionAddress);
      if (address) {
        log('redirectShipment.Ship request required address to proceed!');
        // return res.status(400).redirect('customer.address')
        // .json({ message: 'Ship request required address to proceed!' });
        IsShippingAddress = false;
      }
    }
  } else {
    const optionAddress = {
      attributes: ['id'],
      where: { customer_id: customerId, is_default: 1 },
    };
    log('redirectShipment.testing break point address');
    address = await Address
      .find(optionAddress);
    if (!address) {
      log('redirectShipment.Ship request required address to proceed!');
      // return res.status(400).json({ message: 'Ship request required address to proceed!' });
      IsShippingAddress = false;
    }
  }
  log('redirectShipment.testing break point');

  req.user.package_ids = packageIds;
  req.user.IS_LIQUID = IS_LIQUID;
  req.user.address = address;

  const result = await this.createShipment(req, res, IsShippingAddress);
  return result;
};

exports.state = async (req, res, next) => Shipment
  .findById(req.params.id)
  .then((shipment) => {
    log({ shipment });
    if (SHIPMENT_HANDED === req.body.state_id) {
      if (!shipment.dispatch_date || !shipment.shipping_carrier || !shipment.number_of_packages ||
        !shipment.weight_by_shipping_partner || !shipment.tracking_code) {
        log('You must update Shipment Tracking Information to send dispatch notification!');
        return res.status(400).json({
          message: 'You must update Shipment Tracking Information to send dispatch notification!',
        });
      }
    }

    return Shipment
      .updateShipmentState({
        db,
        shipment,
        actingUser: req.user,
        nextStateId: req.body.state_id,
        comments: req.body.comments,
      })
      .then(status => res.json(status));
  })
  .catch(next);

const models = {
  1: DHLLog,
};

exports.paymentState = async (req, res) => {
  let comments = '';
  let State = '';
  Shipment
    .findById(req.body.shipmentId)
    .then((shipment) => {
      if (req.body.payment === 'completed') {
        comments = 'Shipment Payment suceess';
        State = PAYMENT_COMPLETED;
      } else {
        comments = 'Shipment Payment failed';
        State = PAYMENT_FAILED;
      }
      return Shipment
        .updateShipmentState({
          db,
          shipment,
          actingUser: req.body.user,
          nextStateId: State,
          comments,
        })
        .then(status => res.json(status));
    });
};

exports.updateShipmetStatus = () => {
  const DISPATCHED_TO_DELIVERED = [18, 19, 21, 20, 23, 26, 24, 25, 28, 27, 29, 30, 31, 36];

  return Shipment
    .findAll({
      attributes: [
        'id', 'tracking_code', 'shipping_partner_id',
      ],
      include: [{
        model: ShipmentState,
        attributes: ['id', 'state_id'],
        where: { state_id: DISPATCHED_TO_DELIVERED },
      }],
    })
    .then((shipments) => {
      log('shipments', shipments.length);
      return Promise
        .all(shipments
          .map((shipment) => {
            log('shipment', shipment.toJSON());
            return shipper[shipment.shipping_partner_id]
              .lastStatus(shipment.tracking_code)
              .then(({ customPayload }) => models[shipment.shipping_partner_id]
                .create({
                  shipment_id: shipment.id,
                  ...customPayload,
                }));
          }));
    });
};
// -http://api.shoppre.test/api/public/shipments/1/response?status=1&uid=647

exports.payResponse = async (req, res, next) => {
  try {
    const failedURL = `${URLS_LOGISTICS}/shipRequests/`;
    const sucessURL = `${URLS_LOGISTICS}/transactions/${req.params.id}/response`;
    const { status } = req.query;
    const msg = {
      1: 'Looks like you cancelled the payment. You can try again now or if you ' +
      'faced any issues in completing the payment, please contact us.',
      2: 'Security Error! Please try again after sometime or contact us for support.',
      3: 'Payment transaction failed! You can try again now or if you faced any issues in ' +
        'completing the payment, please contact us.',
      4: 'Unexpected error occurred and payment has been failed',
      5: 'invalid payment gateway',
      6: `success #${req.params.id}`,
    }[status];
    const shipment = await Shipment.findById(req.params.id);
    // - Todo: Security issue
    const customer = await User.findById(req.query.uid, { raw: true });
    Shipment.update({ transaction_id: req.query.transaction_id }, { where: { id: req.params.id } });

    const SUCCESS = '6';
    if (req.query.status === SUCCESS) {
      Shipment
        .updateShipmentState({
          db,
          shipment,
          actingUser: customer,
          nextStateId: PAYMENT_COMPLETED,
          payment_status: 'success',
          comments: `Payment ${req.query.paymentStatus}!`,
        });
      if (req.query.paymentStatus) {
        await Notification.create({
          customer_id: customer.id,
          action_type: 'shipment',
          action_id: shipment.id,
          action_description: `Shipment Payment ${req.query.paymentStatus}!`,
        });
      }
      const paymentGateWay = Number(req.query.pg);
      const { amount } = req.query;
      if (paymentGateWay === WIRE || paymentGateWay === CASH || paymentGateWay === WALLET) {
        res.json(`${sucessURL}?${stringify({
          error: 'success',
          message: msg,
          amount,
        })}`);
      } else {
        res.redirect(`${sucessURL}?error='sucess'&message=${msg}&amount=${amount}`);
      }
    } else {
      Shipment
        .updateShipmentState({
          db,
          shipment,
          actingUser: customer,
          nextStateId: PAYMENT_FAILED,
          payment_status: 'failed',
          comments: 'payment failed',
        });

      res.redirect(`${failedURL}?error='failed'&message=${msg}`);
    }
  } catch (e) {
    next(e);
  }
};

exports.response = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;
  const options = {
    attributes: ['id', 'value_amount', 'address', 'customer_id', 'weight',
      'order_code', 'final_amount', 'package_level_charges_amount', 'customer_name', 'phone'],
    where: { id },
    include: [{
      model: User,
      as: 'Customer',
      attributes: ['id', 'email'],
    }],
  };
  const shipment = await Shipment
    .find(options);
  log({ shipment });
  if (shipment && shipment.customer_id === customerId) {
    // return res.json({ shipment });
    return res.json({ shipment });
  }
  return res.status(404).json({ message: 'shipment not found' });
};

exports.shipRequestResponse = async (req, res) => {
  const { orderCode } = req.params;
  await Shipment.find({
    where: { order_code: orderCode },
    attributes: ['customer_name', 'address', 'phone', 'order_code'],
  }).then(shipment => res.json(shipment));
};

exports.trackingUpdate = async (req, res, next) => {
  try {
    const shipment = req.body;
    shipment.dispatch_date = moment();
    const { id } = req.params;
    const status = await Shipment.update(shipment, { where: { id } });
    return res.json(status);
  } catch (e) {
    return next(e);
  }
};
