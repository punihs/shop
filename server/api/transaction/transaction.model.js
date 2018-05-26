
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    amount: DataTypes.STRING,
    description: DataTypes.STRING,
  }, {
    tableName: 'transactions',
    timestamps: true,
    underscored: true,
  });

  Transaction.associate = (db) => {
    // Transaction.belongsTo(db.Country);      // Need to discuss
    Transaction.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });
  };
  return Transaction;
};

