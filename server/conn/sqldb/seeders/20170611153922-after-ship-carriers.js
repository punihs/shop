const { carriersAfterShip } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('afterShip_carriers', carriersAfterShip);
  },
  down(queryInterface) {
    return queryInterface
      .bulkDelete('afterShip_carriers', { id: carriersAfterShip.map(x => x.id) });
  },
};
