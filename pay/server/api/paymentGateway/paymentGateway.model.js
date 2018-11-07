module.exports = (sequelize, DataTypes) => {
  const PaymentGateway = sequelize.define('PaymentGateway', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    value: DataTypes.STRING,
    fee: DataTypes.DECIMAL(4, 2),
    status: DataTypes.INTEGER,
  }, {
    tableName: 'payment_gateways',
    timestamps: true,
    underscored: true,
    paranoid: true,
  });
  return PaymentGateway;
};

