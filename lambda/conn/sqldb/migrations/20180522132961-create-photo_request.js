const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('photo_requests', Object
      .assign(properties('photoRequest', DataTypes), {
        package_id: keys('packages'),
      }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('photo_requests');
  },
};
