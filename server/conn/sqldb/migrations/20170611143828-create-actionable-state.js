const { engine, timestamps, keys } = require('../helper.js');

module.exports = {
  up(queryInterface, DataTypes) {
    return queryInterface
      .createTable('actionable_states', Object
        .assign({
          id: {
            type: DataTypes.INTEGER(11),
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
          },
          state_id: keys('states'),
          group_id: keys('groups'),
          child_id: keys('states'),
        }, timestamps(3, DataTypes)), engine);
  },
  down(queryInterface) {
    return queryInterface.dropTable('actionable_states');
  },
};
