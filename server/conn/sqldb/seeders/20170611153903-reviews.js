const { review } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('reviews', review, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('reviews', { id: [1] });
  },
};
