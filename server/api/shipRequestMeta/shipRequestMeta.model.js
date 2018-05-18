module.exports = (sequelize, DataTypes) => {
  const ShipRequestMeta = sequelize.define('ShipRequestMeta', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    keywords: DataTypes.STRING,
  }, {
    tableName: 'ship_request_meta',
    timestamps: true,
    underscored: true,
  });
  return ShipRequestMeta;
};
