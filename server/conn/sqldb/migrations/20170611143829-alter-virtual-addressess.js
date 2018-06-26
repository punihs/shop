const { keys } = require('../helper.js');

module.exports = {
  up: queryInterface => queryInterface.addColumn(
    'virtual_addresses',
    'customer_id',
    keys('users'),
  ),
  down(queryInterface) {
    return queryInterface.removeColumn({ tableName: 'virtual_addresses' }, 'customer_id');
  },
};
