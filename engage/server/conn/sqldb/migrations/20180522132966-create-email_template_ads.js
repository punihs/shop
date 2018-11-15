
const {
  engine, timestamps, keys, id,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('email_template_ads', {
      id,
      email_template_id: keys('email_templates'),
      ad_id: keys('ads'),
      ...timestamps(3, DataTypes),
    }, engine),
  down(queryInterface) {
    return queryInterface.dropTable('email_template_ads');
  },
};
