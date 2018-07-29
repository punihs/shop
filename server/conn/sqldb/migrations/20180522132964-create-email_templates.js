
const {
  engine, timestamps, keys, properties, id,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('email_templates', {
      id,
      ...properties('emailTemplate', DataTypes),
      group_id: keys('groups'),
      ...timestamps(3, DataTypes),
    }, engine),
  down(queryInterface) {
    return queryInterface.dropTable('email_templates');
  },
};

