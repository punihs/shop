const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('places', Object
    .assign(properties('place', DataTypes), {
      user_id: keys('users'),
      parent_id: keys('places'),
    }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('places');
  },
};
