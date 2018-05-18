module.exports = (sequelize, DataTypes) => {
  const TotalDetail = sequelize.define('TotalDetail', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    customer_name: DataTypes.STRING,
    country: DataTypes.STRING,
    locker: DataTypes.STRING,
    final_weight: DataTypes.INTEGER,
    personal_shopper_charge: DataTypes.INTEGER,
    clearance_charge: DataTypes.INTEGER,
    package_level_charge: DataTypes.INTEGER,
    pickup_charge: DataTypes.INTEGER,
    shipping_charge: DataTypes.INTEGER,
    paid_by_customer: DataTypes.INTEGER,
    total_charge: DataTypes.INTEGER,
    paid_to_courier: DataTypes.INTEGER,
    packages: DataTypes.INTEGER,
    carrier_name: DataTypes.STRING,
    date_of_dispatch: DataTypes.DATE,
    type_of_shipment: DataTypes.STRING,
    comment: DataTypes.STRING,
    tracking_details: DataTypes.STRING,
    email: DataTypes.STRING,
  }, {
    tableName: 'total_details',
    timestamps: false,
    underscored: true,
  });

  TotalDetail.associate = (db) => {
    TotalDetail.belongsTo(db.Customer);
  };

  return TotalDetail;
};
