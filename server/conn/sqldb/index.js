const _ = require('lodash');
const Sequelize = require('sequelize');

const config = require('../../config/environment');
const oauthComponent = require('../../components/oauth/sequelize');

const sqlDefaults = {
  dialect: 'mysql',
  timezone: '+05:30',
  dialectOptions: {
    decimalNumbers: true,
  },
  define: {
    charset: 'utf8',
    dialectOptions: {
      collate: 'utf8_general_ci',
    },
  },
};

const db = {
  Sequelize,
  sequelize: new Sequelize(config.MYSQL, sqlDefaults),
};

[
  // - Enums
  'Country', 'Place', 'PaymentGateway', 'Locker',

  // - Tracking
  'DHLLog',

  'EmailTemplate', 'EmailLog', 'EmailTemplateAd', 'EmailPreference', 'Ad',

  // - Basic
  'User', 'UserMeta', 'Group', 'PasswordReset', 'Follower', 'SocketSession',

  // - Customer Account
  // Shoppre.com - Inspired by MyUS.com
  'Address', 'UserDocument', 'ShippingPreference', 'VirtualAddress',

  'Order',

  'Package', 'PackageCharge', 'PackageState', 'State', 'ActionableState', 'GroupState',
  'PackageItem',
  'PackageItemCategory',

  'PhotoRequest',

  'Shipment', 'ShipmentMeta', 'ShipmentType', 'ShippingPartner', 'ShipmentState',
  'Transaction',
  // - Notifications
  'Notification', 'Comment',

  // - loyalty points, coupon
  'LoyaltyPoint', 'LoyaltyHistory', 'Redemption', 'ReferCode',

  // - Organitation
  'ShippingRate',

  // - Product
  'Store',

  // - Coupon
  'Coupon',

  // - Reviews
  'Review', 'Feedback',

  // - Estomations
  'Estimation',

  // - payment gateway
  'DirectPayment',

  'Log',

  'Source',

].forEach((model) => {
  db[model] = db.sequelize.import(`../../api/${_.camelCase(model)}/${_.camelCase(model)}.model.js`);
});

oauthComponent(db);

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

module.exports = db;
