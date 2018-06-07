
module.exports = (sequelize, DataTypes) => {
  const ActionableState = sequelize.define('ActionableState', {
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    group_id: DataTypes.INTEGER(11),
    child_id: DataTypes.INTEGER(11),
  }, {
    tableName: 'actionable_states',
    timestamps: true,
    underscored: true,
  });

  ActionableState.associate = (models) => {
    ActionableState.belongsTo(models.State, {
      foreignKey: 'state_id',
    });
  };

  return ActionableState;
};
