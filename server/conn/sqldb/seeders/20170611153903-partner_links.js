const { partnerLinks } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('partner_links', partnerLinks, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('partner_links', { id: [1] });
  },
};
