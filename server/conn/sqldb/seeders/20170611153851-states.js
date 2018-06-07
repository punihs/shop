const { states } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert(
      'states', states,
      {},
    );
  },
  down(queryInterface) {
    return queryInterface.bulkDelete('states', { id: states.map(x => x.id) });
  },
};
