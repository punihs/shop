const properties = require('./state.property');

module.exports = (sequelize, DataTypes) => {
  const State = sequelize.define('State', properties(DataTypes), {
    tableName: 'states',
    timestamps: true,
    underscored: true,
    paranoid: true,
  });

  State.associate = (db) => {
    State.belongsTo(db.State, {
      as: 'Parent',
      foreignKey: 'parent_id',
    });

    State.hasOne(db.GroupState);

    State.hasMany(db.ActionableState, {
      as: 'Actions',
      foreignKey: 'state_id',
    });

    State.hasMany(db.PackageState, {
      defaultScope: {
        order: 'id DESC',
      },
    });

    State.hasMany(db.State, {
      as: 'Childs',
      foreignKey: 'parent_id',
    });
  };

  return State;
};
