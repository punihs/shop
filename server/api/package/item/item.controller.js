const debug = require('debug');
const sequelize = require('sequelize');

const minio = require('../../../conn/minio');
const { PACKAGE } = require('../../../config/constants/buckets');
const { GROUPS: { CUSTOMER } } = require('../../../config/constants');
const {
  PackageItem, PackageItemCategory, Package, PackageState, Store, User,
} = require('../../../conn/sqldb');

const { getPersonalShopperItems } = require('../item/item.service');

const {
  PACKAGE_STATE_IDS: {
    READY_TO_SHIP, ADDED_SHIPMENT, INACTIVE_LOCKER,
  },
  PACKAGE_TYPES: {
    PERSONAL_SHOPPER, COD,
  },
} = require('../../../config/constants');

const log = debug('package');

exports.index = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const { type, customerId, shopperType } = req.query;

    const packageType = shopperType === 'cod' ? COD : PERSONAL_SHOPPER;

    const options = {
      where: {},
    };

    if (type === 'psCustomerSide') {
      const personalShopperItems = await getPersonalShopperItems(customerId, packageType);
      return res.json(personalShopperItems);
    }

    if (type !== 'ps') {
      options.where.package_id = packageId;
    } else {
      options.where.package_order_code = packageId;
    }

    log('index', req.query);

    const packageItems = await PackageItem
      .findAll({
        where: options.where,
        attributes: [
          'id', 'name', 'quantity', 'price_amount', 'total_amount', 'object',
          'object_invoice', 'color', 'size', 'note', 'url', 'status',
          'if_item_unavailable', 'updated_at', 'package_order_code', 'package_id',
        ],
        include: [{
          model: PackageItemCategory,
          attributes: ['name'],
        }],
        order: [['id', 'desc']],
        limit: Number(req.query.limit) || 200,
      });

    return res.json(packageItems);
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { packageId } = req.params;
    const pkgItem = await PackageItem
      .create({
        ...req.body,
        package_id: packageId,
        created_by: req.user.id,
      });

    await Package.update({
      total_quantity: sequelize.literal('total_quantity + 1') }
      , { where: { id: packageId } });

    const packageDetail = await Package
      .find({
        where: { id: packageId },
        attributes: ['id'],
        include: [{
          model: Store,
          attributes: ['id', 'name'],
        },
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'virtual_address_code'],
          as: 'Customer',
        },
        ],
      });

    const packages = await Package.findAll({
      attributes: ['id', 'customer_id'],
      where: { customer_id: packageDetail.Customer.id },
      include: [{
        model: PackageState,
        where: { state_id:  PACKAGE[CUSTOMER].ALL },
      }],
    });
    const packageItems = await PackageItem
      .count({
        where: { package_id: packages.map(x => x.id) },
      });
    return res.json({
      ...packageDetail.toJSON(),
      packageItemId: pkgItem.id,
      itemName: pkgItem.name,
      totalItems: packageItems,
    });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
    const { itemIds } = req.body;
    let packageItem = {};

    const options = {
      where: {},
    };

    if (type !== 'ps') {
      options.where.id = id;
      packageItem = req.body;
      packageItem.total = packageItem.price_amount * packageItem.quantity;
    } else {
      options.where.id = itemIds;
      packageItem.package_id = req.body.packId.pack_id.data.id;
      packageItem.status = 'addedtopackage';
    }

    const status = await PackageItem
      .update(packageItem, { where: options.where });

    return res.json(status);
  } catch (err) {
    return next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const { packageId, id } = req.params;

    const pkg = await Package
      .find({
        attributes: ['id'],
        where: { id: packageId },
        include: [{
          model: PackageItem,
          attributes: ['id'],
          where: { id },
        }, {
          model: PackageState,
          attributes: ['id'],
          where: { state_id: [READY_TO_SHIP, INACTIVE_LOCKER, ADDED_SHIPMENT] },
        }],
      });

    if (pkg) {
      return res
        .status(403)
        .json({
          message: `Package Item ${id} can not delete after ready to ship`,
        });
    }

    await PackageItem
      .destroy({
        where: {
          id,
          package_id: packageId,
        },
      });

    return res.json({ message: `#${id} Package Item deleted sucessfully` });
  } catch (err) {
    return next(err);
  }
};

exports.image = async (req, res, next) => {
  try {
    log('index', req.query);

    const object = await PackageItem
      .findById(req.params.id, {
        attributes: ['id', 'object'],
      });

    const url = await minio
      .downloadLink({ object });

    return res.json({ url });
  } catch (err) {
    return next(err);
  }
};
