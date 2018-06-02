const { sources } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert(
      'sources', sources,
      {},
    );
  },
  down(queryInterface) {
    return queryInterface.bulkDelete('sources', { id: sources.map(x => x.id) });
  },
};
