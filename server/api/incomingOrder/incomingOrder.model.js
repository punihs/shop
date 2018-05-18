module.exports = (sequelize, DataTypes) => {
  const IncomingOrder = sequelize.define('IncomingOrder', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    seller: DataTypes.STRING,
    tracking_number: DataTypes.STRING,
    invoice_no: DataTypes.STRING,
    notes: DataTypes.STRING,
    document: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM,
      values: ['pending', 'received'],
    },
    track_no: DataTypes.STRING,
  }, {
    tableName: 'incoming_orders',
    timestamps: true,
    underscored: true,
  });

  IncomingOrder.associate = (db) => {
    IncomingOrder.belongsTo(db.Customer);
  };

  return IncomingOrder;
};

