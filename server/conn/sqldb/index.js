const _ = require('lodash');
const Sequelize = require('sequelize');

const config = require('../../config/environment');
const oauthComponent = require('../../components/oauth/sequelize');

const { log } = console;

const sqlDefaults = {
  dialect: 'mysql',
  timezone: '+05:30',
};

const db = {
  sequelize: new Sequelize(config.MYSQL, sqlDefaults),
};

[
  'Customer', 'Store', 'Package', 'ShipRequest', 'Address', 'AdminNotification', 'Country',
  'PackageCharge', 'ShippingRate', 'Group', 'Partner', 'Page', 'PackageMail', 'PackagePhoto',
  'PackageItem', 'AccountDocument', 'Admin', 'TotalDetail', 'UrlFeedback', 'WalletTransaction',
  'StoreCatClub', 'StoreCategory', 'State', 'ShoppreSupporter', 'ShoppreEmployee', 'ShopperRequestSelf',
  'ShopperRequest', 'ShopperOrderSelf', 'ShopperOrder', 'ShopperMail', 'ShopperBalance', 'ShipTracking',
  'ShipRequestMeta', 'ShipOption',
].forEach((model) => {
  db[model] = db.sequelize.import(`../../api/${_.camelCase(model)}/${_.camelCase(model)}.model.js`);
});


oauthComponent(db);

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.ShipOption
  .findAll({
    attributes: ['id', 'ship_request_id'],
    limit: 2,
    include: [{
      model: db.ShipRequest,
      attributes: ['id'],
    }],
  }).then(x => log(x.map(y => y.toJSON())));

module.exports = db;
