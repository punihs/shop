const { apps } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('apps', apps, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('apps', { id: [1] });
  },
};
