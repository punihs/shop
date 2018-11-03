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
  'Country', 'Place', 'State', 'GroupState', 'ActionableState',

  // - Tracking
  'DHLLog',

  // - Basic
  'User', 'Group', 'Follower', 'SocketSession',


  'Shipment', 'ShipmentMeta', 'ShipmentType', 'ShippingPartner', 'ShipmentState',

  // - Notifications
  'Notification', 'Comment',

  // - Organitation
  'ShippingRate',

  // - Reviews
  'Review', 'Feedback',

  // - Estomations
  'Estimation',

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
