const debug = require('debug');
const moment = require('moment');
const _ = require('lodash');

const logger = require('../../components/logger');
const ship = require('./components/ship');
const { addressStringify } = require('./components/util');
const { stringify } = require('querystring');
const { calcPackageLevelCharges, calcLiquidCharges } = require('./components/shipRequest');

const hookshot = require('./shipment.hookshot');
const packageService = require('../package/package.service');

const db = require('../../conn/sqldb');

const {
  Country, Shipment, Package, Address, PackageCharge, ShipmentMeta,
  PackageState, User, Locker,
  ShipmentState, Store,
  PackageItem, PhotoRequest,
} = db;

const {
  SHIPMENT_STATE_IDS: {
    SHIPMENT_HANDED, PACKAGING_REQUESTED,
    PAYMENT_COMPLETED, PAYMENT_FAILED, PAYMENT_REQUESTED, PAYMENT_CONFIRMED,
    SHIPMENT_CANCELLED, UPSTREAM_SHIPMENT_REQUEST_CREATED,
    SHIPMENT_MANUAL_FOLLOW_UP, SHIPMENT_LOST, CUSTOM_ON_HOLD, WRONG_ADDRESS,
    RTO_REQUESTED, RAISE_SHIPMENT_LOST_CLAIM, PENALTY_PAYMENT_REQUESTED,
    PENALTY_PAYMENT_DONE, WRONG_ADDRESS_FOLLOW_UP, CLAIM_PROCESSED_TO_CUSTOMER,
    SHIPMENT_DELIVERED, SHIPMENT_DELETED, SHIPMENT_REJECTED_BY_CUSTOMER, RETURN_TO_ORIGIN,
    CUSTOMER_ACKNOWLEDGEMENT_RECEIVED, AMOUNT_RECEIVED_FROM_UPSTREAM, INVOICE_REQUESTED,
  },
  SHIPMENT_HISTORY,
  PACKAGE_STATE_IDS: { READY_TO_SHIP },
  GROUPS: { CUSTOMER },
} = require('../../config/constants');
const { URLS_PARCEL } = require('../../config/environment');

const BUCKETS = require('../../config/constants/buckets');

const { ADDED_TO_SHIPMENT } = require('../../config/constants/packageStates');

const log = debug('s.shipment.controller');
const { index, show, updateShipmentState } = require('./shipment.service');

exports.index = (req, res, next) => index(req, next)
  .then(result => res.json(result))
  .catch(next);

exports.show = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: customerId, group_id: groupId } = req.user;

    if (req.query.transactionSuccessPage) {
      try {
        const shipment = await Shipment
          .find({
            attributes: ['id', 'value_amount', 'address', 'customer_id', 'weight', 'payment_gateway_id',
              'order_code', 'final_amount', 'package_level_charges_amount', 'customer_name', 'phone',
              'transaction_id'],
            where: { order_code: id, customer_id: customerId },
            include: [{
              model: User,
              as: 'Customer',
              attributes: ['id', 'email'],
            }],
          });

        if (!shipment) return res.status(404).json({ message: 'shipment not found' });

        return res.json({ shipment });
      } catch (err) {
        return next(err);
      }
    }

    if (groupId === CUSTOMER) {
      return show(req, res);
    }

    const shipment = await Shipment
      .findById(req.params.id, {
        attributes: req.query.fl
          ? req.query.fl.split(',')
          : ['id', 'customer_id', 'created_at', 'weight', 'final_weight', 'packages_count',
            'pick_up_charge_amount', 'payment_gateway_fee_amount', 'final_amount', 'shipment_type_id',
            'transaction_id'],
        include: [{
          model: ShipmentState,
          attributes: ['id', 'state_id'],
          required: false,
        }, {
          model: ShipmentMeta,
          attributes: ['sticker_charge_amount', 'original', 'mark_personal_use', 'invoice_tax_id', 'repacking_charge_amount', 'extra_packing_charge_amount', 'original_ship_box_charge__amount',
            'consolidation_charge_amount', 'gift_wrap_charge_amount', 'gift_note_charge_amount', 'gift_note_text', 'other_charge_amount',
            'insurance_amount', 'liquid_charge_amount', 'overweight_charge_amount'],
          where: { id: req.params.id },
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
        {
          model: Address,
          attributes: [
            'id', 'city', 'name', 'salutation', 'first_name', 'last_name',
            'phone',
          ],
        }],
      });
    if (!shipment) return res.status(404).end();

    return res.json({
      ...shipment.toJSON(),
      state_id: shipment.ShipmentState && shipment.ShipmentState.state_id,
    });
  } catch (err) {
    return next(err);
  }
};

exports.unread = async (req, res, next) => {
  try {
    const { id } = req.params;

    const status = await Shipment.update({ admin_read: false }, { where: { id } });

    return res.json(status);
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;

    const shipment = await Shipment
      .find({
        attributes: ['id', 'package_level_charges_amount', 'estimated_amount'],
        where: { id },
        include: [{
          model: ShipmentMeta,
          attributes: ['id', 'liquid_charge_amount', 'overweight_charge_amount', 'is_liquid', 'other_charge_amount'],
          where: { id },
        }],
      });

    const updateShipment = req.body;
    const updateMeta = {};
    let packageLevelCharges = shipment.package_level_charges_amount;
    const otherChargeAmount = req.body.other_charge_amount || 0;

    if (shipment.ShipmentMetum.is_liquid === 1) {
      packageLevelCharges -= shipment.ShipmentMetum.liquid_charge_amount || 0;
      updateMeta.liquid_charge_amount = req.body.liquid_charge_amount;
    }

    if (shipment.ShipmentMetum.overweight === '1') {
      packageLevelCharges -= shipment.ShipmentMetum.overweight_charge_amount || 0;

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
    updateMeta.other_charge_amount = otherChargeAmount;

    await ShipmentMeta.update(updateMeta, { where: { id } });

    packageLevelCharges = Number(packageLevelCharges);
    packageLevelCharges += Number(updateMeta.liquid_charge_amount) || 0;
    packageLevelCharges += Number(updateMeta.overweight_charge_amount) || 0;
    updateShipment.package_level_charges_amount = packageLevelCharges;

    const subTotalAmount = req.body.sub_total_amount;
    const discountAmount = req.body.discount_amount;
    const pickUpChargeAmount = req.body.pick_up_charge_amount || 0;
    const estimatedAmount =
      (subTotalAmount - discountAmount) + packageLevelCharges + pickUpChargeAmount
      + otherChargeAmount;

    updateShipment.sub_total_amount = subTotalAmount;
    updateShipment.discount_amount = discountAmount;
    updateShipment.estimated_amount = estimatedAmount;

    await Shipment.update(updateShipment, { where: { id } });

    return res.json(updateShipment);
  } catch (err) {
    return next(err);
  }
};


exports.metaUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const status = await ShipmentMeta.update(req.body, { where: { id } });

    return res.json(status);
  } catch (err) {
    return next(err);
  }
};

exports.destroy = async (req, res, next) => {
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


    await pkg
      .map(packageId => packageService
        .updateState({
          lastStateId: null,
          nextStateId: READY_TO_SHIP,
          pkg: packageId,
          actingUser: req.user,
        }));

    await ShipmentMeta
      .destroy({ where: { shipment_id: id } });

    await updateShipmentState({
      shipment,
      actingUser: req.user,
      nextStateId: SHIPMENT_DELETED,
      comments: 'Shipment Deleted By OPS',
      next,
    });

    await Package
      .update({ shipment_id: null }, { where: { shipment_id: id } });

    return res.json({ message: 'Shipment Deleted' });
  } catch (err) {
    return logger.error('error shipment deletion', err);
  }
};

const getAddress = async ({ addressId, next }) => {
  try {
    return await Address
      .find({
        attributes: ['salutation', 'first_name', 'last_name', 'line1', 'line2', 'state',
          'city', 'pincode', 'phone', 'email', 'country_id'],
        where: { id: addressId },
        include: [{
          model: Country,
          attributes: ['name'],
        }],
      });
  } catch (err) {
    return next(err);
  }
};

const additionKeysMap = {
  consolidation_charge_amount: true,
  repacking_charge_amount: true,
  sticker_charge_amount: true,
  extra_packing_charge_amount: true,
  original_ship_box_charge_amount: true,
  gift_wrap_charge_amount: true,
  gift_note_charge_amount: true,
};

const calculataPackingCharge = obj => Object
  .keys(additionKeysMap)
  .reduce((nxt, key) => {
    if (!additionKeysMap[key]) return nxt;
    return nxt + (obj[key] || 0);
  }, 0);

const getPackages = async ({ actingUser, packageIds, next }) => {
  try {
    return await Package
      .findAll({
        attributes: ['id', 'package_state_id', 'weight', 'content_type', 'price_amount'],
        where: {
          customer_id: actingUser.id,
          id: packageIds,
        },
        include: [{
          attributes: [
            'id', 'storage_amount', 'wrong_address_amount', 'special_handling_amount',
            'receive_mail_amount', 'pickup_amount', 'standard_photo_amount', 'advanced_photo_amount',
            'split_package_amount', 'scan_document_amount'],
          model: PackageCharge,
        }, {
          attributes: ['id', 'package_id'],
          model: PackageState,
          where: {
            state_id: [READY_TO_SHIP],
          },
        }],
      });
  } catch (err) {
    return next(err);
  }
};

const updatePackages = ({
  packageIds,
  stateId,
  actingUser,
  shipmentId,
  next,
}) => {
  try {
    packageIds.map(id => packageService.updateState({
      lastStateId: null,
      nextStateId: stateId,
      pkg: { id },
      actingUser,
    }));

    return Package.update({
      shipment_id: shipmentId,
    }, {
      where: { id: packageIds },
    });
  } catch (err) {
    return next(err);
  }
};

const getShipmentMetaMap = ({ body, NUMBER_OF_PACKAGES, next }) => {
  try {
    const meta = {
      repacking_charge_amount: body.repack ? 100.00 : 0,
      // - Todo: sticker charge amount is 0 always & original_ship_box_charge_amount
      original_ship_box_charge_amount: 0,
      sticker_charge_amount: body.sticker ? 0 : 0,
      gift_wrap_charge_amount: body.gift_wrap ? 100.00 : 0,
      gift_note_charge_amount: body.gift_note ? 50.00 : 0,
      extra_packing_charge_amount: body.extra_packing ? 500.00 : 0,
    };

    if (NUMBER_OF_PACKAGES > 1) {
      meta.consolidation = true;
      meta.consolidation_charge_amount = (NUMBER_OF_PACKAGES - 1) * 100.00;
    }

    return meta;
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const packageIds = req.query.package_ids.split(',');

    // - Get All Packages Related to Ship Request
    const packages = await getPackages({
      actingUser: req.user,
      packageIds,
      next,
    });

    if (!packages.length) {
      return res
        .status(400)
        .json({ message: 'No Packages Found.' });
    }

    // - Get Address to Send Package
    const address = await getAddress({
      addressId: req.body.address_id, next,
    });

    // - Calculate Package Level Charges
    const shipRequest = await calcPackageLevelCharges({
      packages,
    });

    // - Get Pricing from Ship API
    const {
      final_amount: shippingCharge,
      standard_amount: standardAmount,
      discount_amount: discountAmount,
    } = await ship
      .getPricing({
        countryId: address.country_id,
        weight: shipRequest.weight,
        type: packages[0].content_type,
      });

    const shipmentChargeMap = getShipmentMetaMap({
      body: req.body,
      // No of Packages required for consolidation charge calcuation
      NUMBER_OF_PACKAGES: packageIds.length,
      // - Weight Required for Liquid Clearance Charge
      weight: shipRequest.weight,
      next,
    });

    const liquidClearanceCharge = req.body.is_liquid
      ? calcLiquidCharges({ weight: shipRequest.weight })
      : 0;

    const packingCharge = calculataPackingCharge(shipmentChargeMap) + liquidClearanceCharge;

    // - Create Shipment
    const shipment = await Shipment
      .create({
        package_level_charges_amount: packingCharge + shipRequest.package_level_charges_amount,
        liquid_charge_amount: liquidClearanceCharge,
        estimated_amount: shipRequest.package_level_charges_amount + packingCharge + shippingCharge,
        weight: shipRequest.weight,
        packages_count: packages.length,
        value_amount: shipRequest.value_amount,
        sub_total_amount: standardAmount,
        discount_amount: discountAmount,
        pick_up_charge_amount: 0,
        volumetric_weight: 0,

        customer_id: userId,
        customer_name: `${address.first_name} ${address.last_name}`,
        address: addressStringify(address),
        phone: address.phone,
        address_id: address.id,
        final_amount: 0,

        final_weight: shipRequest.weight,
        payment_gateway_name: 'pending',
        payment_status: 'pending',
        status: 'inreview',
        order_code: `${moment().format('YYYYMMDDHHmmss')}-${userId}`,
      });

    await ShipmentMeta
      .upsert({
        id: shipment.id,
        liquid_charge_amount: liquidClearanceCharge,
        ...shipmentChargeMap,
        ...req.body,
      });

    // - Async
    await updatePackages({
      packageIds,
      stateId: ADDED_TO_SHIPMENT,
      actingUser: req.user,
      shipmentId: shipment.id,
      next,
    })
      .catch(err => logger.error({
        t: 'updatePackages',
        body: req.body,
        actingUser: req.user,
        err,
      }));

    // - Async
    await updateShipmentState({
      nextStateId: PACKAGING_REQUESTED,
      shipment,
      actingUser: req.user,
      next,
    })
      .catch(err => logger.error({
        t: 'updateShipmentState',
        body: req.body,
        actingUser: req.user,
        err,
      }));

    // - Async
    hookshot.create({
      actingUser: req.user,
      shipment,
      packages,
      address,
      next,
    });

    return res
      .status(201)
      .json(shipment);
  } catch (e) {
    return next(e);
  }
};


exports.shipQueue = async (req, res, next) => {
  try {
    const options = {
      attributes: [
        'id', 'order_code', 'customer_name', 'address',
        'phone', 'packages_count', 'final_weight', 'wallet_amount', 'package_level_charges_amount',
        'loyalty_amount', 'estimated_amount', 'created_at', 'payment_status',
        'final_amount', 'payment_gateway_fee_amount', 'transaction_id', 'customer_id',
      ],
      where: { customer_id: req.user.id },
      include: [{
        model: ShipmentState,
        attributes: ['state_id'],
        where: {
          state_id: [
            PACKAGING_REQUESTED, PAYMENT_REQUESTED, INVOICE_REQUESTED,
            PAYMENT_COMPLETED, PAYMENT_FAILED, PAYMENT_CONFIRMED,
            UPSTREAM_SHIPMENT_REQUEST_CREATED,
          ],
        },
      }, {
        model: Package,
        attributes: ['id', 'created_at', 'weight', 'price_amount'],
        include: [{
          model: PackageItem,
          attributes: [
            'id', 'quantity', 'price_amount', 'total_amount',
            'object', 'name',
          ],
        }, {
          model: Store,
          attributes: ['id', 'name'],
        }],
      }],
      order: [['updated_at', 'desc']],
    };

    const shipments = await Shipment
      .findAll(options);

    return res.json({ shipments });
  } catch (err) {
    return next(err);
  }
};

exports.count = async (req, res, next) => {
  try {
    const buckets = BUCKETS.SHIPMENT;

    const shipmentCount = await Shipment
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
      });

    return res.json(shipmentCount);
  } catch (err) {
    return next(err);
  }
};

exports.history = async (req, res, next) => {
  try {
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
      }],
      order: [['updated_at', 'desc']],
    };

    const shipments = await Shipment
      .findAll(options);

    return res.json({ shipments });
  } catch (err) {
    return next(err);
  }
};

exports.cancelRequest = async (req, res, next) => {
  try {
    const { id: customerId } = req.user;
    const { id: shipmentId } = req.params;

    const shipment = await Shipment
      .find({
        attributes: ['id', 'created_at', 'order_code', 'customer_id'],
        where: {
          customer_id: customerId,
          id: shipmentId,
        },
        include: [{
          model: ShipmentState,
          attributes: ['id'],
          where: { state_id: PACKAGING_REQUESTED },
        }],
      });

    if (!shipment) return res.status(400).json({ message: 'requested shipment not exist' });

    const CANCELLATION_TIME = moment(shipment.created_at).diff(moment(), 'hours');

    if (CANCELLATION_TIME > 1) {
      const message = 'You can not cancel shipment after 1 hour from shipment creation. ' +
        `creation Time Gap: ${CANCELLATION_TIME}`;

      return res
        .status(400)
        .json({ message });
    }

    await updateShipmentState({
      shipment,
      actingUser: req.user,
      nextStateId: SHIPMENT_CANCELLED,
      comments: 'Shipment Cancelled By Customer',
      next,
    });

    return res.json({
      message: 'Ship request has been cancelled!',
      shipment,
    });
  } catch (err) {
    return next(err);
  }
};

exports.invoice = async (req, res, next) => {
  try {
    const { orderCode: order_code } = req.params;

    const shipment = await Shipment
      .find({
        where: { order_code },
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
      });

    if (!shipment) return res.status(400).end();

    // - Todo: attributes missing
    const packages = await Package
      .findAll({
        where: {
          shipment_id: shipment.id,
        },
      });

    return res.json({
      shipment,
      packages,
    });
  } catch (err) {
    return next(err);
  }
};

exports.finalShipRequest = async (req, res, next) => {
  try {
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

    const url = 'http://pay.shoppre.test/api/transactions/create?';
    const e = shipment.estimated_amount;
    const pg = req.body.payment_gateway_id;

    return res.redirect(`${url}object_id=${shipment.id}&uid=${req.user.id}&estimated=${e}&payment_gateway_id=${pg}`);
  } catch (err) {
    return next(err);
  }
};

exports.createShipment = async (req, res, IsShippingAddress, next) => {
  try {
    const customerId = req.user.id;

    if (!req.user.package_ids) {
      res.status(400).json({ message: 'package is not found' });
    }

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
        attributes: ['id', 'status', 'type'],
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

    packages.forEach((pack) => {
      shipmentMeta.storage_amount += pack.PackageCharge.storage_amount || 0;
      shipmentMeta.photo_amount += pack.PackageCharge.standard_photo_amount || 0;
      shipmentMeta.photo_amount += pack.PackageCharge.advanced_photo_amount || 0;
      shipmentMeta.pickup_amount += pack.PackageCharge.pickup_amount || 0;
      shipmentMeta.special_handling_amount += pack.PackageCharge.special_handling_amount || 0;
      shipmentMeta.receive_mail_amount += pack.PackageCharge.receive_mail_amount || 0;
      shipmentMeta.split_package_amount += pack.PackageCharge.split_package_amount || 0;
      shipmentMeta.wrong_address_amount += pack.PackageCharge.wrong_address_amount || 0;
      shipmentMeta.scan_document_amount += pack.PackageCharge.scan_document_amount || 0;
    });

    const optionsCustomer = {
      attributes: ['id', 'salutation', 'first_name', 'last_name', 'email',
        'virtual_address_code'],
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

    return res.json({
      customer, packages, shipmentMeta, IS_LIQUID, IsShippingAddress,
    });
  } catch (err) {
    return next(err);
  }
};

const FREE_STORAGE_LIMIT_DAYS = 20;
const PACKAGE_CHARGES = {
  DAILY_AFTER_LIMITED_DAYS: 100,
};
const SPECIAL = '2';
const NORMAL = '1';

exports.redirectShipment = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { packageIds } = req.query;

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
          IsShippingAddress = false;
        }
      }
    } else {
      const optionAddress = {
        attributes: ['id'],
        where: { customer_id: customerId, is_default: 1 },
      };

      address = await Address
        .find(optionAddress);

      if (!address) {
        IsShippingAddress = false;
      }
    }

    req.user.package_ids = packageIds;
    req.user.IS_LIQUID = IS_LIQUID;
    req.user.address = address;

    const result = await this.createShipment(req, res, IsShippingAddress);
    return result;
  } catch (err) {
    return next(err);
  }
};

exports.state = async (req, res, next) => {
  try {
    const shipment = await Shipment
      .findById(req.params.id, { raw: true });

    if (SHIPMENT_HANDED === req.body.state_id) {
      if (!shipment.dispatch_date || !shipment.shipping_carrier || !shipment.number_of_packages ||
        !shipment.weight_by_shipping_partner || !shipment.tracking_code) {
        return res.status(400).json({
          message: 'You must update Shipment Tracking Information to send dispatch notification!',
        });
      }
    }

    const status = await updateShipmentState({
      shipment,
      actingUser: req.user,
      nextStateId: req.body.state_id,
      comments: req.body.comments,
      next,
    });

    return res.json(status);
  } catch (err) {
    return next(err);
  }
};


exports.paymentState = async (req, res, next) => {
  try {
    let comments = '';
    let State = '';

    const shipment = Shipment
      .findById(req.body.shipmentId);

    if (req.body.payment === 'completed') {
      comments = 'Shipment Payment suceess';
      State = PAYMENT_COMPLETED;
    } else {
      comments = 'Shipment Payment failed';
      State = PAYMENT_FAILED;
    }

    const status = await updateShipmentState({
      shipment,
      actingUser: req.body.user,
      nextStateId: State,
      comments,
      next,
    });

    return res.json(status);
  } catch (err) {
    return next(err);
  }
};

exports.payResponse = async (req, res, next) => {
  try {
    const failedURL = `${URLS_PARCEL}/shipRequests`;
    const sucessURL = `${URLS_PARCEL}/transactions/${req.query.transaction_id}/response`;
    const { status } = req.query;
    const msg = {
      1: 'Looks like you cancelled the payment. You can try again now or if you ' +
      'faced any issues in completing the payment, please contact us.',
      2: 'Security Error! Please try again after sometime or contact us for support.',
      3: 'Payment transaction failed! You can try again now or if you faced any issues in ' +
      'completing the payment, please contact us.',
      4: 'Unexpected error occurred and payment has been failed',
      5: 'invalid payment gateway',
      6: 'success',
    }[status];

    const shipment = await Shipment
      .find({ where: { order_code: req.params.id } });
    // - Todo: Security issue
    const customer = await User.findById(req.query.uid, { raw: true });

    Shipment.update({
      transaction_id: req.query.transaction_id,
      payment_gateway_id: req.query.pg,
      final_amount: req.query.amount,
      payment_gateway_fee_amount: req.query.pgAmount || 0,
      payment_status: 'success',
    }, { where: { order_code: req.params.id } });

    const SUCCESS = '6';
    log(req.query.status);
    log(req.query);
    if (req.query.status === SUCCESS) {
      await updateShipmentState({
        shipment,
        actingUser: customer,
        nextStateId: PAYMENT_COMPLETED,
        comments: `Payment ${req.query.paymentStatus}!`,
        next,
      });

      const { amount } = req.query;
      const params = {
        object_id: shipment.order_code,
        customer_id: req.query.uid,
        status: 'sucess',
        message: msg,
        amount,
      };

      res.redirect(`${sucessURL}?${stringify(params)}`);
    } else {
      await updateShipmentState({
        shipment,
        actingUser: customer,
        nextStateId: PAYMENT_FAILED,
        comments: 'payment failed',
        next,
      });

      res.redirect(`${failedURL}?error='failed'&message=${msg}`);
    }
  } catch (err) {
    next(err);
  }
};

exports.shipRequestResponse = async (req, res, next) => {
  try {
    const { orderCode } = req.params;

    const shipment = await Shipment.find({
      where: { order_code: orderCode },
      attributes: ['customer_name', 'address', 'phone', 'order_code'],
    });

    return res.json({ shipment });
  } catch (err) {
    return next(err);
  }
};

exports.trackingUpdate = async (req, res, next) => {
  try {
    const shipment = req.body;
    shipment.dispatch_date = moment();
    const { id } = req.params;

    const status = await Shipment.update(shipment, { where: { id } });

    return res.json(status);
  } catch (err) {
    return next(err);
  }
};
