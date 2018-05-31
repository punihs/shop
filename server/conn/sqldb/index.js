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
  'Country', 'PaymentGateway',

  // - Basic
  'User', 'UserMeta', 'Group',

  // - Customer Account
  // Shoppre.com - Inspired by MyUS.com
  'Address', 'UserDocument', 'ShippingPreference',

  'Order',

  'Package', 'PackageMeta',
  'PackageItem',
  'PackageItemCategory',

  'PhotoRequest',

  'Shipment', 'ShipmentMeta', 'ShipmentType', 'ShipmentIssue', 'ShippingPartner',
  'Transaction',
  // - Notifications
  'Notification',

  // - Organitation
  'ShippingPartner', 'PartnerLink',

  // - Product
  'Store',

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

  'Org',
  'ObjectType', 'Keyword', 'Seo',

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
