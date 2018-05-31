const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface.createTable('faqs', Object.assign({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unsigned: true,
      unique: true,
    },
    question: DataTypes.STRING,
    answer: DataTypes.STRING(5000),
    faq_category_id: keys('faq_categories'),
  }, timestamps(3, DataTypes)), engine),

  down(queryInterface) {
    return queryInterface.dropTable('faqs');
  },
};
