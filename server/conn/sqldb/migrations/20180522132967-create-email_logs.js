
const {
  engine, timestamps, keys, properties, id,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('email_logs', {
      id,
      ...properties('emailLog', DataTypes),
      user_id: keys('users'),
      email_template_id: keys('email_templates'),
      ad_id: keys('ads'),
      ...timestamps(3, DataTypes),
    }, engine),
  down(queryInterface) {
    return queryInterface.dropTable('email_logs');
  },
};
