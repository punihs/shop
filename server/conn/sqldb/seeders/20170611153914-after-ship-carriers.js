const { afterShipCarriers } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('afterShip_carriers', afterShipCarriers);
  },
  down(queryInterface) {
    return queryInterface
      .bulkDelete('afterShip_carriers', { id: afterShipCarriers.map(x => x.id) });
  },
};
