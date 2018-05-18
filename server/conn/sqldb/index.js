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
  'Customer', 'Store', 'Package', 'ShipRequest', 'Address', 'AdminNotification', 'Country',
  'PackageCharge', 'ShippingRate', 'Group', 'Partner', 'AccountDocument', 'Admin', 'Announcement', 'Campaign',
  'CampaignStatistic', 'CampaignExpense', 'Cashback', 'ChatEmail', 'City', 'Contact', 'CountryGuide', 'CustomerContact',
  'CustomerSource', 'CustomerSurvey', 'DirectPayment', 'Dump', 'EmailTemplate', 'Estimation', 'Faq', 'FaqCategory',
  'FavoriteStore', 'Feedback', 'FirstVisit', 'FlashSale', 'PackageInvoice',
  'HomePageContent', 'IncomingOrder', 'ItemCategory', 'Keyword', 'LockerCharge', 'LoyaltyHistory', 'loyaltyMisc',
  'LoyaltyPoint', 'MarketingDashboard', 'Migration', 'Org', 'PasswordReset', 'PaymentGateway', 'PhotoRequest',
  'PromoCode', 'PromoCodeApplied', 'RefferCode', 'Review', 'ScanDocument', 'ScanRequest', 'ScheduledMail',
  'SchedulePickup', 'Service', 'ServicePartner', 'ShipMail', 'ShippingPreference',
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

module.exports = db;
