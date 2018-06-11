
const { objectType } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('object_types', objectType, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('object_types', { id: objectType.map(x => x.id) });
  },
};
