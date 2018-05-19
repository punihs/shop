
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'transactions',
    timestamps: false,
    underscored: true,
  });

  Transaction.associate = (db) => {
    Transaction.belongsTo(db.Country);
    Transaction.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });
  };

  return Transaction;
};

