module.exports = (sequelize, DataTypes) => {
  const ShopperMail = sequelize.define('ShopperMail', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    personal_shopper_id: DataTypes.INTEGER,
    condition: DataTypes.STRING,
    type: {
      type: DataTypes.ENUM,
      values: ['shoppre', 'self'],
    },

  }, {
    tableName: 'shopper_mails',
    timestamps: true,
    underscored: true,
  });
  return ShopperMail;
};
