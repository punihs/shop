const debug = require('debug');
const properties = require('./locker.property');

const log = debug('s.api.locker.model');

module.exports = (sequelize, DataTypes) => {
  const Locker = sequelize.define('Locker', {
    ...properties(DataTypes),
    short_name: {
      type: DataTypes.VIRTUAL,
      get() {
        if (!this.getDataValue('name')) return null;
        const name = this.getDataValue('name').split(' ')[0].toUpperCase();
        return `${this.getDataValue('id')}-${name}`;
      },
    },
  }, {
    tableName: 'lockers',
    timestamps: true,
    underscored: true,
  });

  Locker.associate = (db) => {
    Locker.belongsTo(db.User, {
      foreignKey: 'customer_id',
      as: 'Customer',
    });

    db.User.hasOne(db.Locker, {
      foreignKey: 'customer_id',
    });
  };

  Locker.allocation = ({ customerId }) => {
    log('allocation', customerId);
    return Locker
      .find({
        where: { customer_id: customerId },
        attributes: ['id', 'name'],
      })
      .then(locker => (locker
        ? Promise.resolve(locker)
        : Locker
          .update({
            customer_id: customerId,
            allocated_at: new Date(),
          }, {
            where: { customer_id: null },
            limit: 1,
          })
          .then(() => Locker
            .find({
              attributes: ['id', 'name'],
            }, {
              where: {
                customer_id: customerId,
              },
            }))));
  };

  return Locker;
};

