const properties = require('./actionableState.property');

module.exports = (sequelize, DataTypes) => {
  const ActionableState = sequelize.define('ActionableState', properties(DataTypes), {
    tableName: 'actionable_states',
    timestamps: true,
    underscored: true,
  });

  ActionableState.associate = (db) => {
    ActionableState.belongsTo(db.State);
    ActionableState.belongsTo(db.Group);
    ActionableState.belongsTo(db.State, {
      foreignKey: 'child_id',
      as: 'Childs',
    });
  };

  return ActionableState;
};
