const db = require('./../../../conn/sqldb');

const {
  Country, Shipment, ShipmentState, Package, PackageItem, Store,
} = db;

const {
  SHIPMENT_STATE_IDS: {
    SHIPMENT_DELIVERED,
  },
} = require('../../../config/constants');

exports.index = async (req, res) => {
  const shipment = await Shipment.findAll({
    attributes: ['id', 'address', 'country_id', 'weight', 'sub_total_amount', 'discount_amount', 'value_amount'],
    include: [{
      model: ShipmentState,
      attributes: ['id'],
      where: { state_id: SHIPMENT_DELIVERED },
    }, {
      model: Package,
      attributes: ['id'],
      include: [{
        model: PackageItem,
        attributes: ['name', 'price_amount', 'object'],
      }, {
        model: Store,
        attributes: ['name'],
      }],
    }, {
      model: Country,
      attributes: ['name'],
    }],
    limit: 10,
    order: [['id', 'desc']],
  });

  res.json({ shipment });
};
