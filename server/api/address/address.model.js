const properties = require('./address.property');

module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    ...properties(DataTypes),
    name: {
      type: DataTypes.VIRTUAL,
      get() {
        const salutation = this.getDataValue('salutation');
        const firstName = this.getDataValue('first_name');
        const lastName = this.getDataValue('last_name');
        // 'this' allows you to access attributes of the instance
        return `${salutation} ${firstName} ${lastName}`;
      },
    },
    mobile: {
      type: DataTypes.VIRTUAL,
      get() {
        const phoneCode = this.getDataValue('phone_code');
        const phone = this.getDataValue('phone');

        return `+${phoneCode}-${phone}`;
      },
    },
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

