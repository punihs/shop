const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('package_charges', Object
    .assign(properties('packageCharge', DataTypes), {
      id: {
        ...keys('packages'),
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
    }, timestamps(3, DataTypes)), engine),
  down(queryInterface) {
    return queryInterface.dropTable('package_charges');
  },
};
