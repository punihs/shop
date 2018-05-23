
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    salutation: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    line1: DataTypes.STRING,
    line2: DataTypes.STRING,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    pincode: DataTypes.STRING,
    phone_code: DataTypes.STRING,
    phone: DataTypes.STRING,
    is_default: DataTypes.BOOLEAN,
  }, {
    tableName: 'addresses',
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

