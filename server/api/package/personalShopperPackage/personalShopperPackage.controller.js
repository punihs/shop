const debug = require('debug');
const extractDomain = require('extract-domain');
const moment = require('moment');
const _ = require('lodash');

const log = debug('s.personalShopperPackage.controller');
const { updateState } = require('../package.service');
const { getPersonalShopperItems } = require('../item/item.service');
const { taskCreate } = require('../../../components/asana/asana');

const {
  PACKAGE_TYPES: {
    PERSONAL_SHOPPER, COD,
  },
  PACKAGE_STATE_IDS: {
    ORDER_CREATED,
    ORDER_DELETED,
    ORDER_CANCELLED,
    ORDER_PROCEED,
    OTHER_ITEMS_PROCEED,
  },
} = require('../../../config/constants/index');

const {
  PACKAGE: {
    PERSONAL_SHOPPER_PERCENTAGE, SELF_SHOPPER_PERCENTAGE,
  },
} = require('../../../config/constants/charges');

const {
  Package, PackageItem, PackageState, Store, State, User,
} = require('../../../conn/sqldb/index');


const fetchStoreIdOrCreate = async (storeName) => {
  const store = await Store
    .find({
      attributes: ['id'],
      where: { name: storeName },
    });
  if (store) {
    return store.id;
  }
  const newStore = await Store
    .create({ name: storeName, type: 'web' });

  return newStore.id;
};

exports.create = async (req, res, next) => {
  const customerId = req.user.id;

  const price = req.body.price_amount;
  // const storeId = req.body.store_id;
  const { shopperType } = req.body;

  const packageType = shopperType === 'cod' ? COD : PERSONAL_SHOPPER;
  //
  const { url } = req.body;

  const hostname = extractDomain(url);

  const storeId = await fetchStoreIdOrCreate(hostname);

  const psFee = packageType === PERSONAL_SHOPPER ?
    PERSONAL_SHOPPER_PERCENTAGE : SELF_SHOPPER_PERCENTAGE;

  let totalPrice = '';
  let orderId = '';
  let packageOrderCode = '';
  let personalShop = '';

  const checkPersonalShopperPackages = await Package
    .findOne({
      attributes: ['id', 'customer_id', 'store_id', 'order_code'],
      where: {
        store_id: storeId,
        customer_id: customerId,
        package_type: packageType,
      },
      include: [{
        model: PackageState,
        attributes: ['id', 'state_id'],
        where: {
          state_id: ORDER_CREATED,
        },
      },
      {
        model: PackageItem,
        attributes: ['id', 'quantity', 'package_order_code'],
      },
      ],
    });

  let shopPackageId = '';
  let shopPackageOrderCode = '';

  if (checkPersonalShopperPackages) {
    orderId = checkPersonalShopperPackages.id;
    packageOrderCode = checkPersonalShopperPackages.order_code;

    log(checkPersonalShopperPackages);
    const personalShopPackage = {};

    const totalItems = checkPersonalShopperPackages.PackageItems.length;

    const shopperPackage = await Package
      .find({
        attributes: ['total_quantity', 'price_amount', 'id', 'order_code'],
        where: { id: orderId },
      });

    personalShopPackage.total_quantity = req.body.quantity + shopperPackage.total_quantity;
    totalPrice = (req.body.quantity * price) + shopperPackage.price_amount;

    personalShopPackage.price_amount = totalPrice;
    let psCost = (psFee / 100) * totalPrice;
    psCost = Math.round(psCost);

    if (psCost < 200) { psCost = 200; }

    if (totalItems + 1 > 15) {
      psCost += ((totalItems + 1) - 15) * 50;
    }

    personalShopPackage.personal_shopper_cost = psCost;
    personalShopPackage.sub_total = totalPrice + psCost;

    await Package
      .update(personalShopPackage, { where: { id: orderId } });

    shopPackageId = orderId;
    shopPackageOrderCode = packageOrderCode;
  } else {
    const personalShopperPackage = {};
    personalShopperPackage.customer_id = customerId;
    personalShopperPackage.store_id = storeId;
    let orderCode = '';
    let personalShopper = '';

    do {
      if (packageType === PERSONAL_SHOPPER) {
        orderCode = `PS${customerId}${parseInt((Math.random() * (1000 - 100)) + 100, 10)}`;
      } else {
        orderCode = `COD${customerId}${parseInt((Math.random() * (1000 - 100)) + 100, 10)}`;
      }

      personalShopper = Package
        .find({ where: { order_code: orderCode } });
    }
    while (!personalShopper);

    personalShopperPackage.order_code = orderCode;
    personalShopperPackage.total_quantity = req.body.quantity;
    totalPrice = req.body.quantity * price;
    personalShopperPackage.price_amount = totalPrice;

    let psCost = (psFee / 100) * totalPrice;
    psCost = Math.round(psCost);

    if (psCost < 200) { psCost = 200; }

    personalShopperPackage.personal_shopper_cost = psCost;

    personalShopperPackage.sub_total = totalPrice + psCost;
    personalShopperPackage.package_type = packageType;

    personalShop = await Package
      .create(personalShopperPackage);

    shopPackageId = personalShop.id;
    shopPackageOrderCode = personalShop.order_code;

    const orderDetails = await Package
      .find({
        attributes: ['order_code', 'store_id'],
        where: { id: shopPackageId },
        include: [{
          model: User,
          as: 'Customer',
          attributes: ['first_name', 'last_name', 'email', 'id', 'phone'],
        }, {
          model: Store,
          attributes: ['name'],
        }],
      });

    const name = `${orderDetails.Customer.first_name} ${orderDetails.Customer.last_name} - ${orderDetails.order_code}`;
    const notes = `Seller Name - ${orderDetails.Store.name},Phone NO - ${orderDetails.Customer.phone},\n Email - ${orderDetails.Customer.email}, CustomerId - ${orderDetails.Customer.id} `;
    const bearer = '0/76d37fb13148c2dfa9999734bfcdbb1e';
    const projects = '1106432437090454';
    const workspace = '413352110377780';

    taskCreate(name, notes, bearer, projects, workspace);

    await updateState({
      pkg: personalShop,
      actingUser: req.user,
      nextStateId: ORDER_CREATED,
      comments: 'Order Created',
      next,
    });
  }

  const personalShopperItem = {};
  personalShopperItem.package_id = shopPackageId;
  personalShopperItem.package_order_code = shopPackageOrderCode;
  personalShopperItem.quantity = req.body.quantity;
  personalShopperItem.url = req.body.url;
  personalShopperItem.name = req.body.name;
  personalShopperItem.color = req.body.color;
  personalShopperItem.size = req.body.size;
  personalShopperItem.price_amount = price;
  personalShopperItem.total_amount = price * req.body.quantity;
  personalShopperItem.note = req.body.note;
  personalShopperItem.if_item_unavailable = req.body.if_item_unavailable;
  personalShopperItem.status = 'pending';

  const packages = await Package
    .findAll({
      attributes: ['order_code'],
      where: {
        customer_id: customerId,
        package_type: packageType,
      },
      include: [{
        model: PackageState,
        attributes: ['id', 'state_id'],
        where: {
          state_id: ORDER_CREATED,
        },
      }, {
        model: Store,
        attributes: ['id'],
        where: {
          id: storeId,
        },
      }],
    });

  const orderCodes = await packages.map(y => y.order_code);

  const packageItems = await PackageItem
    .findAll({
      attributes: ['id', 'name', 'quantity', 'price_amount', 'total_amount', 'if_item_unavailable', 'color', 'url', 'size'],
      where: {
        package_order_code: orderCodes,
      },
    });

  return res.json({
    packageItems, personalShop, hostname, storeId,
  });
};


exports.editItem = async (req, res, next) => {
  let newQty = '';
  let newPrice = '';
  let shopPackageId = '';
  let packageOrderCode = '';
  let shopPackageOrderCode = '';
  let totalPrice = '';
  const price = req.body.price_amount;
  const customerId = req.user.id;

  const optionsItems = {
    attributes: ['store_id', 'price_amount', 'total_quantity', 'personal_shopper_cost', 'sub_total'],
    include: [{
      model: PackageItem,
      attributes: ['id', 'quantity', 'total_amount'],
      where: {
        id: req.params.id,
      },
    }],
    limit: Number(req.query.limit) || 1,
  };

  const checkPersonalShopperItems = await Package
    .find(optionsItems);

  if (checkPersonalShopperItems) {
    const newStoreId = req.body.store_id;

    const checkPersonalShopperPackages = await Package
      .find({
        attributes: ['id', 'customer_id', 'store_id', 'order_code'],
        where: {
          customer_id: customerId,
          store_id: newStoreId,
          package_type: PERSONAL_SHOPPER,
        },
        include: [{
          model: PackageState,
          attributes: ['id', 'state_id'],
          state_id: ORDER_CREATED,
        }],
        limit: Number(req.query.limit) || 1,
      });

    const oldStoreId = checkPersonalShopperItems.store_id;
    let checkPersonalShopperOldPackages = '';

    checkPersonalShopperOldPackages = await Package
      .find({
        attributes: ['id', 'customer_id', 'store_id', 'order_code', 'total_quantity'],
        where: {
          customer_id: customerId,
          store_id: oldStoreId,
          package_type: PERSONAL_SHOPPER,
        },
        include: [{
          model: PackageState,
          attributes: ['id', 'state_id'],
          state_id: ORDER_CREATED,
        }],
        limit: Number(req.query.limit) || 1,
      });

    if (newStoreId === oldStoreId) {
      if (checkPersonalShopperPackages) {
        const orderId = checkPersonalShopperPackages.id;
        packageOrderCode = checkPersonalShopperPackages.order_code;
        const personalShopPackage = {};

        const shopPackage = await Package
          .findAll({
            attributes: ['total_quantity', 'price_amount'],
            where: { id: orderId },
          });

        newQty = (checkPersonalShopperPackages.total_quantity -
          checkPersonalShopperItems.PackageItems[0].quantity) + req.body.quantity;
        newPrice = checkPersonalShopperPackages.price_amount -
          checkPersonalShopperItems.PackageItems[0].total_amount;
        newPrice += req.body.quantity * price;

        personalShopPackage.price_amount = newPrice;
        personalShopPackage.total_quantity = newQty;
        let psCost = (PERSONAL_SHOPPER_PERCENTAGE / 100) * newPrice;
        psCost = Math.round(psCost);

        if (psCost < 200) {
          psCost = 200;
        }

        if (shopPackage.total_quantity > 15) {
          psCost += (shopPackage.total_quantity - 15) * 50;
        }

        personalShopPackage.personal_shopper_cost = psCost;
        personalShopPackage.sub_total = newPrice + psCost;

        await Package
          .update(personalShopPackage, { where: { id: orderId } });

        shopPackageId = orderId;
        shopPackageOrderCode = packageOrderCode;
      }
    } else {
      const checkQty = checkPersonalShopperOldPackages.total_quantity -
        checkPersonalShopperItems.PackageItems[0].quantity;

      if (checkQty <= 0) {
        await Package
          .destroy({ where: { id: checkPersonalShopperOldPackages.id } });
      } else {
        const priceAmount = checkPersonalShopperItems.price_amount -
          checkPersonalShopperItems.PackageItems[0].total_amount;
        const totalQuantity = checkPersonalShopperItems.total_quantity -
          checkPersonalShopperItems.PackageItems[0].quantity;
        let psCost = (PERSONAL_SHOPPER_PERCENTAGE / 100) * priceAmount;
        psCost = Math.round(psCost);

        if (psCost < 200) {
          psCost = 200;
        }

        if (checkPersonalShopperItems.total_quantity > 15) {
          psCost += (checkPersonalShopperItems.total_quantity - 15) * 50;
        }

        const subTotal = priceAmount + psCost;

        await Package
          .update(
            {
              price_amount: priceAmount,
              total_quantity: totalQuantity,
              sub_total: subTotal,
              personal_shopper_cost: psCost,
            },
            { where: { id: checkPersonalShopperOldPackages.id } },
          );
      }

      const updatePersonalShopperPackages = await Package
        .find({
          attributes: ['id', 'customer_id', 'store_id', 'order_code'],
          where: {
            customer_id: customerId,
            store_id: newStoreId,
            package_type: PERSONAL_SHOPPER,
          },
          include: [{
            model: PackageState,
            attributes: ['id', 'state_id'],
            where: {
              state_id: ORDER_CREATED,
            },
          }],
        });

      log('Pkgs', updatePersonalShopperPackages);

      if (updatePersonalShopperPackages) {
        log(updatePersonalShopperPackages);
        const orderId = updatePersonalShopperPackages.id;
        packageOrderCode = updatePersonalShopperPackages.order_code;

        const personalShopPackage = {};

        const shopPackage = await Package
          .findOne({
            attributes: ['price_amount', 'total_quantity', 'id'],
            where: { id: orderId },
          });

        newQty = shopPackage.total_quantity + req.body.quantity;
        newPrice = shopPackage.price_amount;
        newPrice += req.body.quantity * price;

        personalShopPackage.price_amount = newPrice;
        personalShopPackage.total_quantity = newQty;

        let psCost = (PERSONAL_SHOPPER_PERCENTAGE / 100) * newPrice;
        psCost = Math.round(psCost);

        if (psCost < 200) {
          psCost = 200;
        }

        if (shopPackage.total_quantity > 15) {
          psCost += (shopPackage.total_quantity - 15) * 50;
        }

        personalShopPackage.personal_shopper_cost = psCost;
        personalShopPackage.sub_total = newPrice + psCost;

        await Package
          .update(personalShopPackage, { where: { id: orderId } });

        shopPackageId = orderId;
        shopPackageOrderCode = packageOrderCode;
      } else {
        const personalShopperPackage = {};
        personalShopperPackage.customer_id = customerId;
        personalShopperPackage.store_id = newStoreId;
        let orderCode = '';
        let personalShopper = '';

        do {
          orderCode = `PS${customerId}${parseInt((Math.random() * (1000 - 100)) + 100, 10)}`;

          // eslint-disable-next-line no-await-in-loop
          personalShopper = await Package
            .find({ where: { order_code: orderCode } });
        }

        while (personalShopper);
        personalShopperPackage.order_code = orderCode;
        personalShopperPackage.total_quantity = req.body.quantity;
        totalPrice = req.body.quantity * price;
        personalShopperPackage.price_amount = totalPrice;

        let psCost = (PERSONAL_SHOPPER_PERCENTAGE / 100) * totalPrice;
        psCost = Math.round(psCost);

        if (psCost < 200) {
          psCost = 200;
        }

        if (personalShopperPackage.total_quantity > 15) {
          psCost += (personalShopperPackage.total_quantity - 15) * 50;
        }

        personalShopperPackage.personal_shopper_cost = psCost;

        personalShopperPackage.sub_total = totalPrice + psCost;
        personalShopperPackage.package_type = PERSONAL_SHOPPER;

        const personalShop = await Package
          .create(personalShopperPackage);

        shopPackageId = personalShop.id;
        shopPackageOrderCode = personalShop.order_code;

        await updateState({
          pkg: personalShop,
          actingUser: req.user,
          nextStateId: ORDER_CREATED,
          comments: 'Order Created',
          next,
        });
      }
    }
    const personalShopperItem = {};
    personalShopperItem.package_id = shopPackageId;
    personalShopperItem.package_order_code = shopPackageOrderCode;
    personalShopperItem.store_type = req.body.store_type;
    personalShopperItem.quantity = req.body.quantity;
    personalShopperItem.url = req.body.url;
    personalShopperItem.code = req.body.code;
    personalShopperItem.name = req.body.name;
    personalShopperItem.color = req.body.color;
    personalShopperItem.size = req.body.size;
    personalShopperItem.price_amount = price;
    personalShopperItem.total_amount = price * req.body.quantity;
    personalShopperItem.note = req.body.note;
    personalShopperItem.if_item_unavailable = req.body.if_item_unavailable;
    personalShopperItem.status = 'pending';

    await PackageItem
      .update(personalShopperItem, { where: { id: checkPersonalShopperItems.PackageItems[0].id } });

    return res.json(personalShopperItem);
  }

  return res.json(checkPersonalShopperItems);
};

exports.destroyItem = async (req, res, next) => {
  const customerId = req.user.id;
  let newQty = '';
  let newPrice = '';
  let subtotal = '';
  const packageId = req.params.id;
  const { itemId } = req.params;

  const { shopperType } = req.body;

  const packageType = shopperType === 'cod' ? COD : PERSONAL_SHOPPER;

  const psFee = packageType === 'PERSONAL_SHOPPER' ? PERSONAL_SHOPPER_PERCENTAGE : SELF_SHOPPER_PERCENTAGE;

  const optionsItems = {
    attributes: ['id', 'price_amount', 'total_quantity', 'store_id', 'customer_id', 'order_code'],
    where: { id: packageId },
    include: [{
      model: PackageItem,
      attributes: ['id', 'quantity', 'package_order_code'],
    }],
  };

  const personalShopperPackage = await Package
    .findOne(optionsItems);

  const totalItems = personalShopperPackage.PackageItems.length;

  const packageItem = await PackageItem
    .find({
      attributes: ['id', 'quantity', 'price_amount', 'total_amount', 'package_order_code'],
      where: { id: itemId },
      limit: Number(req.query.limit) || 1,
    });

  newQty = personalShopperPackage.total_quantity -
    packageItem.quantity;
  newPrice = personalShopperPackage.price_amount -
    packageItem.total_amount;

  if (newQty <= 0) {
    await updateState({
      pkg: personalShopperPackage,
      actingUser: req.user,
      nextStateId: ORDER_DELETED,
      comments: 'Order Deleted',
      next,
    });
  } else {
    const personalShopPackage = {};

    personalShopPackage.price_amount = newPrice;
    personalShopPackage.total_quantity = newQty;

    let psCost = (psFee / 100) * newPrice;
    psCost = Math.round(psCost);

    if (psCost < 200) {
      psCost = 200;
    }

    if (totalItems - 1 > 15) {
      psCost += ((totalItems - 1) - 15) * 50;
    }

    subtotal = newPrice + psCost;
    personalShopPackage.sub_total = subtotal;
    personalShopPackage.personal_shopper_cost = psCost;

    await Package
      .update(personalShopPackage, { where: { id: packageId } });

    await PackageItem
      .destroy({ where: { id: itemId } });
  }

  const packageItems = await getPersonalShopperItems(customerId);

  return res.json(packageItems);
};

exports.destroyOrder = async (req, res, next) => {
  const customerId = req.user.id;
  const orderId = req.params.id;

  const options = {
    attributes: ['id', 'customer_id', 'store_id'],
    where: {
      customer_id: customerId,
      id: orderId,
      package_type: PERSONAL_SHOPPER,
    },
    include: [{
      model: PackageState,
      attributes: ['id', 'state_id', 'package_id'],
      state_id: ORDER_CREATED,
    }],
  };

  const personalShopPackage = await Package
    .find(options);

  if (personalShopPackage) {
    await updateState({
      pkg: personalShopPackage,
      actingUser: req.user,
      nextStateId: ORDER_DELETED,
      comments: 'Order Deleted',
      next,
    });
  }

  return res.json(personalShopPackage);
};

exports.submitOptions = async (req, res) => {
  let subtotal = '';
  let personalShopPackage = '';
  const personalShopper = req.body;
  const personalshop = {};
  // eslint-disable-next-line no-restricted-syntax
  for (personalShopPackage of personalShopper) {
    const orderId = personalShopPackage.id;

    // eslint-disable-next-line no-await-in-loop
    const shopPackage = await Package
      .find({
        attributes: ['price_amount', 'total_quantity', 'personal_shopper_cost'],
        where: { id: orderId },
      });

    subtotal = shopPackage.price_amount;
    const saleTax = personalShopPackage.sales_tax;
    const shipCharge = personalShopPackage.delivery_charge;

    if (saleTax) {
      personalshop.sales_tax = saleTax;
      subtotal += saleTax;
    }

    if (shipCharge) {
      personalshop.delivery_charge = shipCharge;
      subtotal += shipCharge;
    }

    if (shopPackage.personal_shopper_cost) {
      subtotal += shopPackage.personal_shopper_cost;
    }

    personalshop.sub_total = subtotal;

    personalshop.promo_code = personalShopPackage.promo_code;
    personalshop.promo_info = personalShopPackage.promo_info;
    personalshop.if_promo_unavailable = personalShopPackage.if_promo_unavailable;
    personalshop.instruction = personalShopPackage.instruction;
    // eslint-disable-next-line no-await-in-loop
    await Package
      .update(personalshop, { where: { id: orderId } });
  }

  return res.json(Package);
};

exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  if (req.body.status === 'recieved') {
    Object.assign(body, { received_date: moment() });
  }
  const allowed = _.pick(body, ['status', 'received_date']);

  await PackageItem
    .update(allowed, { where: { id } });

  return res.json(id);
};

exports.cancelOrder = async (req, res, next) => {
  const customerId = req.user.id;
  const orderId = req.params.id;

  const personalShopPackage = await Package
    .find({
      attributes: ['id', 'customer_id', 'store_id'],
      where: {
        customer_id: customerId,
        id: orderId,
      },
      limit: Number(req.query.limit) || 1,
    });

  if (personalShopPackage) {
    const personalShopItem = {};

    await updateState({
      pkg: personalShopPackage,
      actingUser: req.user,
      nextStateId: ORDER_CANCELLED,
      comments: 'Order Cancelled',
      next,
    });

    personalShopItem.status = 'cancelled';

    await PackageItem
      .update(personalShopItem, { where: { package_id: orderId } });
  }

  return res.json(personalShopPackage);
};

exports.proceed = async (req, res, next) => {
  const customerId = req.user.id;
  const orderId = req.params.id;

  const personalShopPackage = await Package
    .find({
      attributes: ['id', 'customer_id', 'store_id'],
      where: {
        customer_id: customerId,
        id: orderId,
      },
      limit: Number(req.query.limit) || 1,
    });

  if (personalShopPackage) {
    await updateState({
      pkg: personalShopPackage,
      actingUser: req.user,
      nextStateId: ORDER_PROCEED,
      comments: 'Order Proceed',
      next,
    });
  }

  return res.json(personalShopPackage);
};

exports.itemsProceed = async (req, res, next) => {
  const customerId = req.user.id;
  const orderId = req.params.id;

  const personalShopPackage = await Package
    .find({
      attributes: ['id', 'customer_id', 'store_id'],
      where: {
        customer_id: customerId,
        id: orderId,
      },
      limit: Number(req.query.limit) || 1,
    });

  if (personalShopPackage) {
    await updateState({
      pkg: personalShopPackage,
      actingUser: req.user,
      nextStateId: OTHER_ITEMS_PROCEED,
      comments: 'Other Items Proceed',
      next,
    });
  }

  return res.json(personalShopPackage);
};

exports.history = async (req, res, next) => {
  const customerId = req.user.id;
  const { shopperType } = req.query;
  const packageType = shopperType === 'cod' ? COD : PERSONAL_SHOPPER;
  const packages = await Package
    .findAll({
      where: {
        customer_id: customerId,
        package_type: packageType,
      },
      include: [{
        model: Store,
        attributes: ['id', 'name'],
      }, {
        model: PackageState,
        attributes: ['id', 'state_id'],
        include: [{
          model: State,
          attributes: ['id', 'name'],
        }],
      }],
      order: [['updated_at', 'desc']],
    })
    .catch(next);

  return res.json({ packages });
};

exports.paymentSuccess = async (req, res, next) => {
  const customerId = req.user.id;
  const id = req.query.object_id;

  const packages = await Package
    .findAll({
      where: {
        customer_id: customerId,
        id,
      },
      include: [{
        model: PackageState,
        attributes: ['id', 'state_id', 'package_id'],
        include: [{
          model: State,
          attributes: ['id', 'name'],
        }],
      }, {
        model: Store,
        attributes: ['id', 'name'],
      }],
    })
    .catch(next);

  return res.json({ packages });
};
