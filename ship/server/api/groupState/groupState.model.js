const properties = require('./groupState.property');

module.exports = (sequelize, DataTypes) => {
  const GroupState = sequelize.define('GroupState', properties(DataTypes), {
    tableName: 'group_states',
    timestamps: false,
    underscored: true,
    indexes: [{ unique: true, fields: ['group_id', 'state_id'] }],
  });

  GroupState.associate = (models) => {
    GroupState.belongsTo(models.Group);
    GroupState.belongsTo(models.State);
  };

  return GroupState;
};
