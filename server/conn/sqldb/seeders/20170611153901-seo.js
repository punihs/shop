const { seo } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('seo', seo, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('seo', { truncate: true, cascade: false });
  },
};
