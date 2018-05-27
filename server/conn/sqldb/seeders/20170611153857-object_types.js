
const { objectTypes } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('object_types', objectTypes, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('object_types', { id: objectTypes.map(x => x.id) });
  },
};
