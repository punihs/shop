const { codState } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert(
      'states', codState,
      {},
    );
  },
  down(queryInterface) {
    return queryInterface.bulkDelete('states', { id: codState.map(x => x.id) });
  },
};
