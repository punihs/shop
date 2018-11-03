const { country } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('countries', country, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('countries', { truncate: true, cascade: false });
  },
};
