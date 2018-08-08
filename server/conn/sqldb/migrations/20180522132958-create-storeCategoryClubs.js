const {
  engine, timestamps, keys, properties,
} = require('../helper.js');


module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface
      .createTable('store_category_clubs', Object
        .assign(properties('storeCategoryClub', DataTypes), {
          store_id: keys('stores'),
          store_category_id: keys('store_categories'),
        }, timestamps(3, DataTypes)), engine);
  },
  down(queryInterface) {
    return queryInterface.dropTable('store_category_clubs');
  },
};

