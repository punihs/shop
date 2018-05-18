module.exports = (sequelize, DataTypes) => {
  const ShipMail = sequelize.define('ShipMail', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    condition: DataTypes.STRING,
  }, {
    tableName: 'ship_mails',
    timestamps: true,
    underscored: true,
  });

  ShipMail.associate = (db) => {
    ShipMail.belongsTo(db.ShipRequest);
  };

  return ShipMail;
};

