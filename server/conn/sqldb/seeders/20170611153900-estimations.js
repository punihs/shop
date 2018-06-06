const { estimations } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('estimations', estimations, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('estimations', { truncate: true, cascade: false });
  },
};