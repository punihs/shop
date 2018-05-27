module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
  });

  Product.associate = (db) => {
    Product.belongsTo(db.User);
  };

  return Product;
};

