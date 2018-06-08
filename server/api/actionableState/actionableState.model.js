
module.exports = (sequelize, DataTypes) => {
  const ActionableState = sequelize.define('ActionableState', {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
  }, {
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
