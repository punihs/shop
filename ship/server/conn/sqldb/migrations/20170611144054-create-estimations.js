const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('estimations', Object
    .assign(properties('estimation', DataTypes), {
      customer_id: keys('users'),
      country_id: keys('countries'),
    }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('estimations');
  },
};
