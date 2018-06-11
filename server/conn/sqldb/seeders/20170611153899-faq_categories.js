const { faqCategory } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('faq_categories', faqCategory, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('faq_categories', { truncate: true, cascade: false });
  },
};
