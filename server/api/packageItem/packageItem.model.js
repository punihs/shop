module.exports = (sequelize, DataTypes) => {
  const PackageItem = sequelize.define('PackageItem', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    item: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    price: DataTypes.DOUBLE,
    total: DataTypes.DOUBLE,
    file_name: DataTypes.STRING,
    confirm_by: {
      type: DataTypes.ENUM,
      values: ['shoppre', 'customer'],
    },

  }, {
    tableName: 'package_items',
    timestamps: true,
    underscored: true,
  });

  PackageItem.associate = (db) => {
    // PackageItem.hasMany(db.ItemCategory)
    PackageItem.belongsTo(db.Package);
  };

  return PackageItem;
};

