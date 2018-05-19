const { SHIPMENT_TYPES: { DOC, NONDOC } } = require('../../config/constants');

module.exports = (sequelize, DataTypes) => {
  const Estimation = sequelize.define('Estimation', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    amount: DataTypes.DOUBLE,
    weight: DataTypes.DOUBLE,
    type: {
      type: DataTypes.ENUM,
      values: [DOC, NONDOC],
    },
  }, {
    tableName: 'estimations',
    timestamps: true,
    underscored: true,
  });

  Estimation.associate = (db) => {
    Estimation.belongsTo(db.User);
    Estimation.belongsTo(db.Country);
  };

  return Estimation;
};

