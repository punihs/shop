const db = require('../../conn/sqldb');

const {
  ShipmentType,
} = db;

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'name'],
  };

  return ShipmentType
    .findAll(options)
    .then(shipmentTypes => res.json(shipmentTypes))
    .catch(next);
};
