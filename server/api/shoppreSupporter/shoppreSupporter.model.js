module.exports = (sequelize, DataTypes) => {
  const ShoppreSupporter = sequelize.define('ShoppreSupporter', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    email_id: DataTypes.STRING,
    phone_number: DataTypes.INTEGER,
    date_of_birth: DataTypes.DATE,
    department: DataTypes.STRING,
  }, {
    tableName: 'shoppre_supporters',
    timestamps: false,
    underscored: true,
  });

  return ShoppreSupporter;
};

