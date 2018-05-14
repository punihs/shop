
module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define('Package', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    order_id: DataTypes.STRING,
    type: DataTypes.STRING,
    seller: DataTypes.STRING,
    reference: DataTypes.STRING,
    locker: DataTypes.STRING,
    weight: DataTypes.STRING,
    number_of_items: DataTypes.INTEGER,
    price: DataTypes.STRING,
    received: DataTypes.DATE,
    status: DataTypes.STRING,

    review: DataTypes.STRING,
    return_send: DataTypes.STRING,
    liquid: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    is_featured_seller: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
    split_pack: DataTypes.STRING,
    info: DataTypes.STRING,
    admin_read: {
      type: DataTypes.ENUM,
      values: ['yes', 'no'],
    },
    admin_info: DataTypes.STRING,
    is_item_damaged: {
      type: DataTypes.ENUM,
      values: ['0', '1'],
    },
  }, {
    tableName: 'packages',
    timestamps: true,
    underscored: true,
  });

  Package.associate = (db) => {
    Package.hasOne(db.PackageCharge);
    Package.belongsTo(db.Customer);
  };

  return Package;
};

