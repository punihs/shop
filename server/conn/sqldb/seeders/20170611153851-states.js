const { state } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert(
      'states', state,
      {},
    );
  },
  down(queryInterface) {
    return queryInterface.bulkDelete('states', { id: state.map(x => x.id) });
  },
};
