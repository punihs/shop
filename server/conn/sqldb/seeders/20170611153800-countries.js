const countries = require('./data/countries');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('countries', countries, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('countries', { truncate: true, cascade: false });
  },
};
