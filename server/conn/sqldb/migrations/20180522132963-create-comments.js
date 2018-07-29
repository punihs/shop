const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('comments', {
      ...properties('comment', DataTypes),
      user_id: keys('users'),
      // package_id: keys('packages'),
      ...timestamps(3, DataTypes),
    }, engine),
  down(queryInterface) {
    return queryInterface.dropTable('comments');
  },
};
