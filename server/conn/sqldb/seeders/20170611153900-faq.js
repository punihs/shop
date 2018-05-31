const { faq } = require('../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('faqs', faq, {});
  },

  down(queryInterface) {
    return queryInterface.destroy('faqs', { truncate: true, cascade: false });
  },
};
