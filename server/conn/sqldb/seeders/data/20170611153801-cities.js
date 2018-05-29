const { cities } = require('../../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('cities', cities, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('cities', { truncate: true, cascade: false });
  },
};
