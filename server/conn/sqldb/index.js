const _ = require('lodash');
const Sequelize = require('sequelize');

const config = require('../../config/environment');
const oauthComponent = require('../../components/oauth/sequelize');

const sqlDefaults = {
  dialect: 'mysql',
  timezone: '+05:30',
};

const db = {
  sequelize: new Sequelize(config.MYSQL, sqlDefaults),
};

[
  // - Enums
  'State', 'Country', 'PaymentGateway',

  // - Basic
  'User', 'UserMeta', 'UserSource', 'Group',

  // - Customer Account
  'Address', 'UserDocument', 'ShippingPreference',

  // - Pricing
  'ShippingRate', 'Estimation',

  'Order',

  'Package', 'PackageMeta',
  'PackageItem',
  'PackageItemCategory',


  'PhotoRequest',

  'Shipment', 'ShipmentMeta',

  // - Pickups & Dropoffs
  'Pickup',

  'Coupon', 'ShipmentCoupon', 'Cashback',

  // - Mail Infra
  'EmailTemplate',

  // - Notifications
  'Notification',
  'Announcement',

  // - Logging
  'Review',
  'Survey',

  // - Finance
  'WalletTransaction',

  // - HR
  'Supporter', 'Employee',

  // - Shoppre Digital - Marketing
  'HttpReferrer',

  // - Organitation
  'ShippingPartner',

  // - Product
  'Store', 'StoreCategory', 'Category',
  'StoreUser',

  'Org',
  'Service', 'ServicePartner',

  'CountryGuide', 'Faq', 'FaqCategory',
  'Campaign', 'CampaignStatistic', 'CampaignExpense',

  // - SEO
  'Page',

  // - Content Marketing
  'Content',
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
