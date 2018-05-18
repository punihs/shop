module.exports = (sequelize, DataTypes) => {
  const WalletTransaction = sequelize.define('WalletTransaction', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    description: DataTypes.STRING,
    amount: DataTypes.DOUBLE,
  }, {
    tableName: 'wallet_transactions',
    timestamps: true,
    underscored: true,
  });

  WalletTransaction.associate = (db) => {
    WalletTransaction.belongsTo(db.Customer);
  };

  return WalletTransaction;
};
