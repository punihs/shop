const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('options', Object
      .assign(properties('options', DataTypes), properties('options', DataTypes), {
        store_id: keys('stores'),
      }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('options');
  },
};
