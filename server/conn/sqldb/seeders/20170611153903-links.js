const { link } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('links', link, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('links', { truncate: true, cascade: false });
  },
};
