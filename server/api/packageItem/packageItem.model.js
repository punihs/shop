const debug = require('debug');
const properties = require('./packageItem.property');
const logger = require('./../../components/logger');
const smartcrop = require('./../../conn/minio/smartcrop');

const log = debug('s-api-transaction-model');

module.exports = (sequelize, DataTypes) => {
  const PackageItem = sequelize.define('PackageItem', properties(DataTypes), {
    tableName: 'package_items',
    timestamps: true,
    paranoid: true,
    underscored: true,
    hooks: {
      afterCreate(packageItem) {
        log('action', packageItem.toJSON());
        if (packageItem.object) {
          const parts = packageItem.object.split('.');
          return smartcrop(packageItem.object, `${parts[0]}-thumb.${parts.pop()}`, 35, 35)
            .then(() => packageItem
              .update({ is_image_resized: true }))
            .catch(err => logger.error('hook', err));
        }

        return packageItem;
      },
    },
  });

  PackageItem.associate = (db) => {
    PackageItem.belongsTo(db.User, {
      foreignKey: 'created_by',
      as: 'Creator',
    });
    PackageItem.belongsTo(db.Package);
    PackageItem.belongsTo(db.PackageItemCategory);
    db.PackageItemCategory.belongsTo(db.PackageItem);
  };

  return PackageItem;
};

