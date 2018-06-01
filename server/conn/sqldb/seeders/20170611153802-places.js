const { places } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('places', places, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('places', { truncate: true, cascade: false });
  },
};

