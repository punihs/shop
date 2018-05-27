const {
  engine, timestamps, keys, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable(
      'seo',
      Object
        .assign(
          properties('seo', DataTypes),
          { created_by: keys('users') },
          timestamps(3, DataTypes),
        ),
      engine,
    ),
  down(queryInterface) {
    return queryInterface.dropTable('seo');
  },
};
