const { keywords } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('keywords', keywords, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('keywords', { id: [1] });
  },
};
