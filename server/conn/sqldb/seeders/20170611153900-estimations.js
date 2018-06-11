const { estimation } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('estimations', estimation, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('estimations', { truncate: true, cascade: false });
  },
};
