module.exports = (sequelize, DataTypes) => {
  const DirectPayment = sequelize.define('DirectPayment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,
    amount: DataTypes.DOUBLE,
    comment: DataTypes.STRING,
    payment_status: DataTypes.STRING,
    finance_reference: DataTypes.STRING,
    finance_comments: DataTypes.STRING,
  }, {
    tableName: 'direct_payments',
    timestamps: true,
    underscored: true,
  });
  DirectPayment.associate = (db) => {
    DirectPayment.belongsTo(db.ShipRequest);
  }

  return DirectPayment;
};

