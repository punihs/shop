module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER(14),
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true,
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  payment_status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  finance_reference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  finance_comments: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});
