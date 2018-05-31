const { faqCategories } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('faq_categories', faqCategories, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('faq_categories', { truncate: true, cascade: false });
  },
};
