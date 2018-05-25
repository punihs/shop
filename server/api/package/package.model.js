
module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define('Package', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    order_code: DataTypes.STRING,
    type: DataTypes.INTEGER,
    reference_code: DataTypes.STRING,
    locker_code: DataTypes.STRING,
    weight: DataTypes.STRING,
    number_of_items: DataTypes.INTEGER,
    price_amount: DataTypes.STRING,
    received_at: DataTypes.DATE,
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
    paranoid: true,
  });

  Package.associate = (db) => {
    Package.hasOne(db.PackageMeta);
    Package.hasOne(db.Store);
    Package.belongsTo(db.Shipment);
    Package.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });

    Package.belongsTo(db.User, {
      foreignKey: 'created_by',
      as: 'Creator',
    });
  };

  return Package;
};

