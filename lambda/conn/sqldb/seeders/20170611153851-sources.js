const { source } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert(
      'sources', source,
      {},
    );
  },
  down(queryInterface) {
    return queryInterface.bulkDelete('sources', { id: source.map(x => x.id) });
  },
};
