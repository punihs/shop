module.exports = (sequelize, DataTypes) => {
  const CustomerContact = sequelize.define('CustomerContact', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    alt_phone: DataTypes.STRING,
    alt_code: DataTypes.STRING,
    alt_email: DataTypes.STRING,
  }, {
    tableName: 'customer_contacts',
    timestamps: true,
    underscored: true,
  });

  CustomerContact.associate = (db) => {
    CustomerContact.belongsTo(db.Customer);
  };

  return CustomerContact;
};

