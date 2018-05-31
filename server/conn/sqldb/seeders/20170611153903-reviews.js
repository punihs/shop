const { reviews } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('reviews', reviews, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('reviews', { id: [1] });
  },
};
