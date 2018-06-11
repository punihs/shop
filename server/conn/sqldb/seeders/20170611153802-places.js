const { place } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('places', place, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('places', { truncate: true, cascade: false });
  },
};

