const { keyword } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('keywords', keyword, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('keywords', { id: [1] });
  },
};
