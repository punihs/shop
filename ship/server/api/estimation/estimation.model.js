const properties = require('./estimation.property');

module.exports = (sequelize, DataTypes) => {
  const Estimation = sequelize.define('Estimation', properties(DataTypes), {
    tableName: 'estimations',
    timestamps: false,
    underscored: true,
    paranoid: true,
  });

  Estimation.associate = (db) => {
    Estimation.belongsTo(db.User);
    Estimation.belongsTo(db.Country);
  };

  return Estimation;
};
