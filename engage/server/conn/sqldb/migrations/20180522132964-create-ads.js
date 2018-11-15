
const {
  engine, timestamps, properties, id,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('ads', {
      id,
      ...properties('ad', DataTypes),
      ...timestamps(3, DataTypes),
    }, engine),
  down(queryInterface) {
    return queryInterface.dropTable('ads');
  },
};
