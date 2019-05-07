const { carrierAfterShip } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('afterShip_carriers', carrierAfterShip);
  },
  down(queryInterface) {
    return queryInterface
      .bulkDelete('afterShip_carriers', { id: carrierAfterShip.map(x => x.id) });
  },
};
