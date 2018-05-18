module.exports = (sequelize, DataTypes) => {
  const FlashSale = sequelize.define('FlashSale', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    slug: DataTypes.STRING,
    name: DataTypes.STRING,
    starts_at: DataTypes.DATE,
  }, {
    tableName: 'flash_sales',
    timestamps: true,
    underscored: true,
  });

  FlashSale.associate = (db) => {
    FlashSale.belongsTo(db.Store);
  };

  return FlashSale;
};

