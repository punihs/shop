const {
  engine, timestamps, properties,
} = require('../helper.js');

module.exports = {
  up: (queryInterface, DataTypes) => queryInterface
    .createTable('feedbacks', Object
      .assign(
        properties('feedback', DataTypes),
        timestamps(3, DataTypes),
      ), engine),
  down(queryInterface) {
    return queryInterface.dropTable('feedbacks');
  },
};
