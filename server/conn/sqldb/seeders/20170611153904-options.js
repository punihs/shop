const { options } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('options', options, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('options', { truncate: true, cascade: false });
  },
};
