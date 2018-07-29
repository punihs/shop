const debug = require('debug');
const {
  TRANSACTION_TYPES: { CREDIT },
  PACKAGE_TYPES: {
    PERSONAL_SHOPPER,
  },
} = require('../../config/constants');
const minio = require('./../../conn/minio');
const logger = require('./../../components/logger');


const log = debug('s.personalShopperPackage.controller');
const {
  Package, PackageItem, Notification, User, Transaction,
} = require('./../../conn/sqldb');

exports.orderForm = (req, res, next) => {
  const personalShopperItemCount = PackageItem
    .count({ where: { package_id: req.params.id, status: 'pending' } })
    .catch(next);
  return res.json({ personalShopperItemCount });
};

exports.create = async (req, res, next) => {
  const customerId = req.user.id;
  const price = req.body.price_amount;
  const storeId = req.body.store_id;
  let totalPrice = '';
  let orderId = '';

  let checkPersonalShopperPackages = await Package
    .findAll({
      attributes: ['id'],
      where: {
        store_id: storeId,
        customer_id: req.user.id,
        status: 'pending',
        package_type: PERSONAL_SHOPPER,
      },
      limit: Number(req.query.limit) || 1,
    });

  let shopPackageId = '';
  if (checkPersonalShopperPackages.length) {
    checkPersonalShopperPackages = JSON
      .parse(JSON.stringify(checkPersonalShopperPackages).replace('[', '').replace(']', ''));
    orderId = checkPersonalShopperPackages.id;

    const options = {
      attributes: ['total_quantity', 'total_amount', 'id'],
      where: { id: orderId },
    };

    log(checkPersonalShopperPackages);
    const personalShopPackage = {};

    const shopperPackage = await Package
      .find(options);

    personalShopPackage.total_quantity = req.body.quantity + shopperPackage.total_quantity;
    totalPrice = (req.body.quantity * price) + shopperPackage.total_amount;

    personalShopPackage.total_amount = totalPrice;
    let psCost = (7 / 100) * totalPrice;
    psCost = Math.round(psCost);
    if (psCost < 200) { psCost = 200; }
    if (personalShopPackage.total_quantity > 15) {
      psCost += (personalShopPackage.total_quantity - 15) * 50;
    }
    personalShopPackage.personal_shopper_cost = psCost;
    personalShopPackage.sub_total = totalPrice + psCost;

    await Package
      .update(personalShopPackage, { where: { id: orderId } });

    shopPackageId = orderId;
  } else {
    const personalShopperPackage = {};
    personalShopperPackage.customer_id = customerId;
    personalShopperPackage.store_id = storeId;
    let referenceNumber = '';
    let personalShopper = '';

    do {
      referenceNumber = `P${customerId}${parseInt((Math.random() * (1000 - 100)) + 100, 10)}`;

      personalShopper = Package
        .find({ where: { reference_code: referenceNumber } });
    }

    while (personalShopper.length);

    personalShopperPackage.reference_code = referenceNumber;
    personalShopperPackage.total_quantity = req.body.quantity;
    totalPrice = req.body.quantity * price;
    personalShopperPackage.total_amount = totalPrice;

    let psCost = (7 / 100) * totalPrice;
    psCost = Math.round(psCost);
    if (psCost < 200) { psCost = 200; }

    if (personalShopperPackage.total_quantity > 15) {
      psCost += (personalShopperPackage.total_quantity - 15) * 50;
    }

    personalShopperPackage.personal_shopper_cost = psCost;

    personalShopperPackage.sub_total = totalPrice + psCost;
    personalShopperPackage.status = 'pending';
    personalShopperPackage.package_type = PERSONAL_SHOPPER;

    await Package
      .create(personalShopperPackage)
      .then((personalShop) => {
        shopPackageId = personalShop.id;
      })
      .catch(next);
  }
  const personalShopperItem = {};
  personalShopperItem.package_id = shopPackageId;
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
    .create(personalShopperItem);

  return res.json(personalShopperItem);
};

exports.shopperCart = async (req, res, next) => {
  const customerId = req.user.id;

  const packages = await Package
    .findAll({ where: { customer_id: customerId, status: 'pending', package_type: PERSONAL_SHOPPER } });

  const personalShopperItemCount = await PackageItem
    .count({ where: { package_id: req.params.id, status: 'pending' } })

    .catch(next);
  return res.json({ packages, personalShopperItemCount });
};

exports.editOrder = async (req, res, next) => {
  const customerId = req.user.id;

  const packages = await Package
    .findAll({
      where: {
        customer_id: customerId, id: req.params.id, status: 'pending', package_type: PERSONAL_SHOPPER,
      },
    });

  const personalShopperItemCount = await PackageItem
    .count({ where: { package_id: req.params.id, status: 'pending' } })

    .catch(next);
  return res.json({ packages, personalShopperItemCount });
};

exports.updateOrder = async (req, res) => {
  let newQty = '';
  let newPrice = '';
  let shopPackageId = '';
  let totalPrice = '';
  const price = req.body.price_amount;
  const customerId = req.user.id;

  const optionsItems = {
    attributes: ['store_id'],
    include: [{
      model: PackageItem,
      attributes: ['id', 'quantity', 'total_amount'],
    }],
    limit: Number(req.query.limit) || 1,
  };

  const checkPersonalShopperItems = await Package
    .find(optionsItems);

  if (checkPersonalShopperItems) {
    const newStoreId = req.body.store_id;


    const checkPersonalShopperPackages = await Package
      .find({
        where: {
          customer_id: customerId,
          status: 'pending',
          store_id: newStoreId,
          package_type: PERSONAL_SHOPPER,
        },
        limit: Number(req.query.limit) || 1,
      });

    const oldStoreId = checkPersonalShopperItems.store_id;
    let checkPersonalShopperOldPackages = '';

    checkPersonalShopperOldPackages = await Package
      .find({
        where: {
          customer_id: customerId,
          status: 'pending',
          store_id: oldStoreId,
          package_type: PERSONAL_SHOPPER,
        },
        limit: Number(req.query.limit) || 1,
      });

    if (newStoreId === oldStoreId) {
      if (checkPersonalShopperPackages) {
        const orderId = checkPersonalShopperPackages.id;

        const options = {
          attributes: ['total_quantity', 'total_amount'],
          where: { id: orderId },
        };

        const personalShopPackage = {};

        const shopPackage = await Package
          .findAll(options);

        // - Todo: @meena111 Please Check
        newQty = (checkPersonalShopperPackages.total_quantity -
          (checkPersonalShopperItems.PackageItems[0] || { quantity: 0 }).quantity) +
          req.body.quantity;

        newPrice = checkPersonalShopperPackages.total_amount -
          (checkPersonalShopperItems.PackageItems[0] || { total_amount: 0 }).total_amount;
        newPrice += req.body.quantity * price;


        personalShopPackage.total_amount = newPrice;
        personalShopPackage.total_quantity = newQty;
        let psCost = (7 / 100) * newPrice;
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
      }
    } else {
      const checkQty = checkPersonalShopperOldPackages.total_quantity -
        checkPersonalShopperItems.PackageItems[0].quantity;

      if (checkQty <= 0) {
        await Package
          .destroy({ where: { id: checkPersonalShopperOldPackages.id } });
      }

      const updatePersonalShopperPackages = await Package
        .find({
          where: {
            customer_id: customerId,
            status: 'pending',
            store_id: newStoreId,
            package_type: PERSONAL_SHOPPER,
          },
          limit: Number(req.query.limit) || 20,
        });

      if (updatePersonalShopperPackages) {
        log(updatePersonalShopperPackages);
        const orderId = updatePersonalShopperPackages.id;

        const options = {
          attributes: ['total_amount', 'total_quantity'],
          where: { id: orderId },
        };

        const personalShopPackage = {};

        const shopPackage = await Package
          .findAll(options);


        newQty = updatePersonalShopperPackages.total_quantity + req.body.quantity;
        newPrice = updatePersonalShopperPackages.total_amount;
        newPrice += req.body.quantity * price;

        personalShopPackage.total_amount = newPrice;
        personalShopPackage.total_quantity = newQty;

        let psCost = (7 / 100) * newPrice;
        psCost = Math.round(psCost);
        if (psCost < 200) {
          psCost = 200;
        }

        if (shopPackage.total_quantity > 15) {
          psCost += (shopPackage.total_quantity - 15) * 50;
        }

        personalShopPackage.personal_shopper_cost = psCost;
        personalShopPackage.sub_total = newPrice + psCost;
        log('546', updatePersonalShopperPackages);

        await Package
          .update(personalShopPackage, { where: { id: orderId } });

        shopPackageId = orderId;
      } else {
        const personalShopperPackage = {};
        personalShopperPackage.customer_id = customerId;
        personalShopperPackage.store_id = newStoreId;
        let referenceNumber = '';
        let personalShopper = '';

        do {
          referenceNumber = `P${customerId}${parseInt((Math.random() * (1000 - 100)) + 100, 10)}`;

          // eslint-disable-next-line no-await-in-loop
          personalShopper = await Package
            .find({ where: { reference_code: referenceNumber } });
        }

        while (personalShopper);
        personalShopperPackage.reference_code = referenceNumber;
        personalShopperPackage.total_quantity = req.body.quantity;
        totalPrice = req.body.quantity * price;
        personalShopperPackage.total_amount = totalPrice;

        let psCost = (7 / 100) * totalPrice;
        psCost = Math.round(psCost);
        if (psCost < 200) {
          psCost = 200;
        }

        if (personalShopperPackage.total_quantity > 15) {
          psCost += (personalShopperPackage.total_quantity - 15) * 50;
        }

        personalShopperPackage.personal_shopper_cost = psCost;

        personalShopperPackage.sub_total = totalPrice + psCost;
        personalShopperPackage.status = 'pending';
        personalShopperPackage.package_type = PERSONAL_SHOPPER;
        log('1', personalShopperPackage);

        const packageId = await Package
          .create(personalShopperPackage);

        shopPackageId = packageId.id;
      }
    }
    const personalShopperItem = {};
    personalShopperItem.package_id = shopPackageId;
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
      .update(personalShopperItem, {
        where: {
          id: (checkPersonalShopperItems.PackageItems[0] || { quantity: 0 }).id,
        },
      });

    return res.json(personalShopperItem);
  }
  return res.json(checkPersonalShopperItems);
};

exports.destroyReq = async (req, res) => {
  const customerId = req.user.id;
  let newQty = '';
  let newPrice = '';
  let subtotal = '';

  const optionsItems = {
    attributes: ['store_id'],
    include: [{
      model: PackageItem,
      attributes: ['id', 'quantity', 'total_amount'],
    }],
    limit: Number(req.query.limit) || 1,
  };

  let oldStoreId = '';

  const checkPersonalShopperItems = await Package
    .find(optionsItems);

  if (checkPersonalShopperItems) {
    oldStoreId = checkPersonalShopperItems.store_id;
  }
  const personalShopperPackage = await Package
    .find({
      attributes: ['id', 'total_amount', 'total_quantity'],
      where: {
        customer_id: customerId,
        status: 'pending',
        store_id: oldStoreId,
        package_type: PERSONAL_SHOPPER,
      },
      limit: Number(req.query.limit) || 1,
    });

  // - Todo: @meena111 Please check
  newQty = personalShopperPackage.total_quantity -
    (checkPersonalShopperItems.PackageItems[0] || { quantity: 0 }).quantity;
  newPrice = personalShopperPackage.total_amount -
    (checkPersonalShopperItems.PackageItems[0] || { total_amount: 0 }).total_amount;

  if (newQty <= 0) {
    await Package
      .destroy({ where: { id: personalShopperPackage.id } });

    await PackageItem
      .destroy({ where: { id: (checkPersonalShopperItems.PackageItems[0] || { id: 0 }).id } });
  } else {
    const orderId = personalShopperPackage.id;

    const options = {
      attributes: ['total_amount', 'total_quantity'],
      where: { id: orderId },
    };

    const personalShopPackage = {};

    const shopPackage = await Package
      .findAll(options);

    personalShopPackage.total_amount = newPrice;
    personalShopPackage.total_quantity = newQty;

    let psCost = (7 / 100) * newPrice;
    psCost = Math.round(psCost);
    if (psCost < 200) {
      psCost = 200;
    }
    if (shopPackage.total_quantity > 15) {
      psCost += (shopPackage.total_quantity - 15) * 50;
    }
    subtotal = newPrice + psCost;
    personalShopPackage.sub_total = subtotal;
    personalShopPackage.personal_shopper_cost = psCost;

    await Package
      .update(personalShopPackage, { where: { id: orderId } });

    await PackageItem
      .destroy({ where: { id: (checkPersonalShopperItems.PackageItems[0] || { id: 0 }).id } });
  }
  return res.json(PackageItem);
};

exports.destroyOrder = async (req, res) => {
  const customerId = req.user.id;
  const orderId = req.body.package_id;

  const options = {
    attributes: ['id'],
    where: {
      customer_id: customerId, status: 'pending', id: orderId, package_type: PERSONAL_SHOPPER,
    },
  };

  const personalShopPackage = await Package
    .findAll(options);

  if (personalShopPackage.length) {
    let personalShop = {};
    // eslint-disable-next-line no-restricted-syntax
    for (personalShop of personalShopPackage) {
      // eslint-disable-next-line no-await-in-loop
      await PackageItem
        .destroy({ where: { package_id: orderId } });
    }
    await Package
      .destroy({ where: { id: personalShop.id } });
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

    const options = {
      attributes: ['total_amount', 'total_quantity', 'personal_shopper_cost'],
      where: { id: orderId },
    };

    // eslint-disable-next-line no-await-in-loop
    const shopPackage = await Package
      .find(options);

    subtotal = shopPackage.total_amount;
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

exports.submitPayment = async (req, res) => {
  const customerId = req.user.id;
  const personalShopPackage = {};
  let shopPackage = {};
  const personalShopItem = {};
  if (req.body.hdn_reference_code) {
    shopPackage = await Package
      .findAll({
        where: {
          customer_id: customerId,
          status: 'pending',
          reference_code: req.body.hdn_reference_code,
          payment_status: 'pending',
          package_type: PERSONAL_SHOPPER,
        },
      });
  } else {
    shopPackage = await Package
      .findAll({
        where: {
          customer_id: customerId,
          status: 'pending',
          payment_status: 'pending',
          package_type: PERSONAL_SHOPPER,
        },
      });
  }
  if (shopPackage) {
    let personalShop = '';
    let orderIds = [];
    // eslint-disable-next-line no-restricted-syntax
    for (personalShop of shopPackage) {
      orderIds = personalShop.id;
    }
    req.user.orderIds = orderIds;

    switch (req.body.payment_gateway_name) {
      case 'card':
        res.json({ message: 'Axis' });
        break;

      // eslint-disable-next-line no-case-declarations
      case 'wire':
        personalShopPackage.payment_gateway_name = 'wire';
        personalShopPackage.payment_status = 'pending';
        personalShopPackage.status = 'awaiting';

        await Package
          .update(personalShopPackage, {
            where:
              { customer_id: customerId, id: orderIds, package_type: PERSONAL_SHOPPER },
          });

        personalShopItem.status = 'awaiting';

        await PackageItem
          .update(personalShopItem, {
            where:
              { package_id: orderIds },
          });

        let shopper = '';
        // eslint-disable-next-line no-restricted-syntax
        for (shopper of shopPackage) {
          const notification = {};
          notification.customer_id = customerId;
          notification.action_type = 'shopper';
          notification.action_id = shopper.id;
          notification.action_description = `Selected Wire Transfer as Payment option - Packages#  ${shopper.package_id}`;
          // eslint-disable-next-line no-await-in-loop
          await Notification
            .create(notification);
        }
        res.json({ message: 'personal shopper response' });
        break;

      case 'paypal':
        res.json({ message: 'Paypal' });
        break;

      case 'wallet':
        res.json({ message: 'wallet' });
        break;

      case 'paytm':
        res.json({ message: 'Paytm' });
        break;

      default:
        res.json({ message: 'personal shopper response' });
        break;
    }
  } else {
    res.json({ message: 'personal shopper cart' });
  }
};

exports.orderPayChange = async (req, res) => {
  const customerId = req.user.id;
  let personalShopperItemCartCount = '';
  let shopperPackages = '';
  let shopPackage = '';
  if (req.body.reference_code) {
    shopPackage = await Package
      .find({
        where: {
          reference_code: req.body.reference_code,
        },
        limit: Number(req.query.limit) || 1,
      });

    const orderId = shopPackage.id;

    personalShopperItemCartCount = await PackageItem
      .count({
        where: {
          status: 'pending',
          package_id: orderId,
        },
      });

    shopperPackages = await Package
      .find({
        where: {
          customer_id: customerId,
          reference_code: req.body.reference_code,
        },
      });
  } else {
    shopperPackages = await Package
      .find({
        where: {
          customer_id: customerId,
          reference_code: req.body.reference_code,
          package_type: PERSONAL_SHOPPER,
        },
      });
    const orderId = shopperPackages.id;

    personalShopperItemCartCount = await PackageItem
      .count({
        where: {
          package_id: orderId,
          status: 'pending',
        },
      });
  }
  return res.json(personalShopperItemCartCount, shopperPackages, shopPackage);
};

exports.shopperResponse = async (req, res) => {
  if (req.user.orderIds) {
    const customerId = req.user.id;
    const { orderIds } = req.user;

    const personalShopPackage = await Package
      .findAll({
        where: {
          customer_id: customerId, id: orderIds, package_type: PERSONAL_SHOPPER,
        },
      });

    let personalShop = {};
    const orderId = personalShopPackage.id;

    // eslint-disable-next-line no-restricted-syntax
    for (personalShop of personalShopPackage) {
      const notification = {};
      notification.customer_id = customerId;
      notification.action_type = 'shopper';
      notification.action_id = orderId;
      notification.action_description = `Personal Shopper request submitted - Packages#  ${personalShop.reference_code}`;
      // eslint-disable-next-line no-await-in-loop
      await Notification
        .create(notification);
    }
    const paymentGatewayName = personalShop.payment_gateway_name;

    const personalShopperItemCount = await PackageItem
      .count({ where: { package_id: orderId, status: 'pending' } });

    return res.json({ personalShopPackage, personalShopperItemCount, paymentGatewayName });
  }
  return res.json({ messege: 'status' });
};

exports.shopperOptions = async (req, res, next) => {
  const customerId = req.user.id;

  const packages = await Package
    .findAll({ where: { customer_id: customerId, status: 'pending', package_type: PERSONAL_SHOPPER } });

  const orderId = packages.id;

  const personalShopperItemCount = await PackageItem
    .count({ where: { package_id: orderId, status: 'pending' } })

    .catch(next);
  return res.json({ packages, personalShopperItemCount });
};

exports.shopperSummary = async (req, res, next) => {
  const customerId = req.user.id;

  const packages = await Package
    .findAll({ where: { customer_id: customerId, status: 'pending', package_type: PERSONAL_SHOPPER } });

  const orderId = packages.id;

  const personalShopperItemCount = await PackageItem
    .count({ where: { package_id: orderId, status: 'pending' } })

    .catch(next);
  return res.json({ packages, personalShopperItemCount });
};

exports.shopperPayment = async (req, res, next) => {
  const customerId = req.user.id;

  const packages = await Package
    .findAll({ where: { customer_id: customerId, status: 'pending', package_type: PERSONAL_SHOPPER } });

  const orderId = packages.id;

  const personalShopperItemCount = await PackageItem
    .count({ where: { package_id: orderId, status: 'pending' } })

    .catch(next);
  return res.json({ packages, personalShopperItemCount });
};

exports.shopperHistory = async (req, res, next) => {
  const customerId = req.user.id;

  const packages = await Package
    .findAll({
      where: {
        customer_id: customerId,
        package_type: PERSONAL_SHOPPER,
        $not: { status: 'pending' },
      },
      packages: [['created_at', 'desc']],
    });

  const orderId = packages.id;

  const personalShopperItemCount = await PackageItem
    .count({ where: { package_id: orderId, status: 'pending' } })

    .catch(next);
  return res.json({ packages, personalShopperItemCount });
};

exports.cancelShopper = async (req, res) => {
  const customerId = req.user.id;
  const referenceNumber = req.body.reference_code;

  const personalShopPackage = await Package
    .find({
      where: {
        customer_id: customerId,
        reference_code: referenceNumber,
        package_type: PERSONAL_SHOPPER,
      },
      limit: Number(req.query.limit) || 1,
    });

  const orderId = personalShopPackage.id;
  if (personalShopPackage) {
    const ShopPackage = {};
    const personalShopItem = {};

    ShopPackage.status = 'canceled';
    await Package
      .update(ShopPackage, {
        where: {
          customer_id: customerId, id: orderId, package_type: PERSONAL_SHOPPER,
        },
      });

    personalShopItem.status = 'canceled';

    await PackageItem
      .update(personalShopItem, { where: { package_id: orderId } });

    const notification = {};
    notification.customer_id = customerId;
    notification.action_type = 'shopper';
    notification.action_id = orderId;
    notification.action_description = `Personal Shopper request cancelled - Packages#  ${referenceNumber}`;

    await Notification
      .create(notification);
  }
  return res.json(personalShopPackage);
};

exports.orderInvoice = async (req, res) => {
  const customerId = req.user.id;
  const referenceNumber = req.body.reference_code;

  const customer = await User
    .find({ where: { id: customerId } });

  const personalShopPackage = await Package
    .findAll({
      where: {
        customer_id: customerId,
        reference_code: referenceNumber,
        package_type: PERSONAL_SHOPPER,
      },
      limit: Number(req.query.limit) || 1,
    });

  return res.json({ personalShopPackage, customer });
};

exports.index = (req, res, next) => {
  const options = {
    limit: Number(req.query.limit) || 20,
    attributes: ['id'],
  };
  if (req.query.customer_id) {
    options.where = { customer_id: req.query.customer_id };
  }
  if (req.query.status) {
    options.where = { status: req.query.status };
  }

  return Package
    .findAll(options)
    .then(personalShopperPackage => res.json(personalShopperPackage))
    .catch(next);
};

exports.show = (req, res) => Package
  .findById(req.params.id)
  .then(personalShopperPackage => res.json(personalShopperPackage));

exports.unread = async (req, res) => {
  const { id } = req.params;

  const status = await Package
    .update({ admin_read: false }, { where: { id } });

  return res.json(status);
};

exports.updateOrderItem = async (req, res) => {
  const { id } = req.params;

  const status = await PackageItem
    .update({ status: req.body.status }, { where: { id } });

  return res.json(status);
};

exports.updateShopOrder = async (req, res, next) => {
  const orderId = req.body.package_id;

  const personalShopPackage = await Package
    .find({ where: { id: orderId } });

  if (!personalShopPackage) {
    return res.json({ message: 'admin.shopper.packages' });
  }
  const customer = await User
    .find({ where: { id: personalShopPackage.customer_id } });
  try {
    const { seller_invoice: sellerInvoice } = req.body;

    if (sellerInvoice && !['txt', 'pdf'].includes(sellerInvoice.filename.split('.').pop())) {
      return res.status(400).end('Invalid File');
    }

    if (req.body.seller_invoice) {
      minio
        .base64UploadCustom('personal_shopper_orders', orderId, sellerInvoice)
        .then(({ object }) => personalShopPackage.update({ seller_invoice: object }))
        .catch(err => logger.error('personalShopperOrders.express', err, req.user, req.body));
    }
  } catch (e) {
    return next(e);
  }

  const personalShop = {};
  personalShop.amount_paid = req.body.amount_paid;
  const totalWalletAmount = customer.wallet_balance_amount;
  const transactions = {};

  // eslint-disable-next-line default-case
  switch (req.body.status) {
    case 'awaiting':
      personalShop.status = 'awaiting';
      break;
    case 'received':
      personalShop.status = 'received';
      personalShop.payment_status = 'success';
      break;
    // eslint-disable-next-line no-case-declarations
    case 'processed':
      if (!(personalShop.amount_paid) || !(personalShopPackage.seller_invoice)) {
        return res.json({ error: 'Please update final amount paid to website and seller invoice to proceed!' });
      }
      personalShop.status = 'processed';
      const customerPaidToWebsite = personalShopPackage.total_amount +
        personalShopPackage.sales_tax + personalShopPackage.delivery_charge;
      const walletAdded = customerPaidToWebsite - personalShop.amount_paid;
      customer.wallet_balance_amount = totalWalletAmount + walletAdded;
      transactions.description = 'personal shopper ';
      transactions.amount = walletAdded;
      transactions.customer_id = customer.id;
      transactions.type = CREDIT;
      await Transaction
        .create(transactions);
      break;
    // eslint-disable-next-line no-case-declarations
    case 'canceled':
      personalShop.status = 'canceled';
      await PackageItem
        .update({ status: 'canceled' }, { where: { package_id: orderId } });
      break;
    case 'completed':
      personalShop.status = 'completed';
      break;
  }
  Package
    .update(personalShop, { where: { id: orderId } });
  return res.json({ message: 'Packages status updated!' });
};
