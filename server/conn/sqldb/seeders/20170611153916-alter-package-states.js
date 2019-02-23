const { packageInactiveState } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('states', packageInactiveState);
  },
  down(queryInterface) {
    return queryInterface
      .bulkDelete('states', { id: packageInactiveState.map(x => x.id) });
  },
};
