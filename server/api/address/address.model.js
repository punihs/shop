
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'address',
    timestamps: false,
    underscored: true,
    paranoid: true,
  });

  Address.associate = (db) => {
    Address.belongsTo(db.Country);
    Address.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });
  };

  return Address;
};

