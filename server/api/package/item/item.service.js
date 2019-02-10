const {
  Package, PackageItem, PackageState, Store,
} = require('../../../conn/sqldb');

const {
  PACKAGE_TYPES: {
    PERSONAL_SHOPPER,
  },
  PACKAGE_STATE_IDS: {
    ORDER_CREATED,
  },
} = require('../../../config/constants/index');

exports.getPersonalShopperItems = async (customerId) => {
  const packages = await Package
    .findAll({
      attributes: ['id', 'order_code', 'store_id'],
      where: {
        customer_id: customerId,
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

  const packageIds = await packages.map(y => y.id);

  const pkg = await Package
    .findAll({
      attributes: [
        'id',
        'delivery_charge',
        'if_promo_unavailable',
        'promo_code',
        'promo_info',
        'sales_tax',
        'personal_shopper_cost',
        'price_amount',
        'sub_total',
        'buy_if_price_changed',
      ],
      where: {
        id: packageIds,
      },
      include: [{
        model: PackageItem,
        attributes: ['id', 'name', 'quantity', 'price_amount', 'total_amount', 'package_id', 'if_item_unavailable', 'color', 'url', 'size'],
      },
      {
        model: Store,
        attributes: ['id', 'name'],
      },
      ],
    });

  if (pkg[0]) {
    if (pkg[0].PackageItems) {
      return pkg;
    }
  }

  return null;
};
