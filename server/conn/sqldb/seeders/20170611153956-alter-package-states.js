const { packageDeleteState } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('states', packageDeleteState);
  },
  down(queryInterface) {
    return queryInterface
      .bulkDelete('states', { id: packageDeleteState.map(x => x.id) });
  },
};
