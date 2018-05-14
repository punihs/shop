
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
  });

  Address.associate = (db) => {
    Address.belongsTo(db.Country);
  };

  return Address;
};

