const _ = require('lodash');
const Sequelize = require('sequelize');

const config = require('../../config/environment');
const oauthComponent = require('../../components/oauth/sequelize');

const sqlDefaults = {
  dialect: 'mysql',
  timezone: '+05:30',
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

  // - Basic
  'User', 'UserMeta', 'Group', 'Estimation',

  // - Customer Account
  // Shoppre.com - Inspired by MyUS.com
  'Address', 'UserDocument', 'ShippingPreference', 'VirtualAddress',

  'Order',

  'Package', 'PackageMeta', 'PackageState', 'State', 'ActionableState', 'GroupState',
  'PackageItem', 'PackageComment',
  'PackageItemCategory',

  'PhotoRequest',

  'Shipment', 'ShipmentMeta', 'ShipmentType', 'ShipmentIssue', 'ShippingPartner',
  'Transaction',
  // - Notifications
  'Notification',

  // - loyalty points, coupon
  'LoyaltyPoint', 'LoyaltyHistory', 'Redemption',

  // - Organitation
  'ShippingPartner', 'Link',

  // - Product
  'Store', 'Category',

  // - faq
  'FaqCategory', 'Faq',
  // - Coupon
  'Coupon',

  // - Reviews
  'Review', 'Feedback',

  // - Estomations
  'Estimation',

  // Shoppre Digital Inspired by Marketo.com
  // - Website - Google My Business - Hardy
  // - SEO - MOZ
  // - Marketing Emails - iContact
  // - Content Curation - Mousree, Vishwa
  // - Digital content - blog, social media
  // - Website Informative content - Research based work
  // - Design - Sujith Greenpepper,
  // - Mobile App Design - Krutika
  // - Mobile App Development - Yogendra

  // - As a Internal Employee
  // - Seed Internal Employee login in db
  // - Creater SEO Product

  // - As a enduser
  // - Vismaya Signup to SD
  // - Creates a Org
  // - Automatically signup to SEO
  // - Vismaya Create object_types related shoppre business
  // - services,
  // - shipping_partners, payment_gateways,
  // - countries, stores, cities
  // - customers, packages, package_items, shipments
  'Product',

  'Log',

  'Org',
  'ObjectType', 'Keyword', 'Seo', 'Source',

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
