const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('package_comments', {
      ...properties('packageComment', DataTypes),
      user_id: keys('users'),
      package_id: keys('packages'),
      ...timestamps(3, DataTypes),
    }, engine),
  down(queryInterface) {
    return queryInterface.dropTable('package_comments');
  },
};
