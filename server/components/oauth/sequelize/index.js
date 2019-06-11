const _ = require('lodash');
const Sequelize = require('sequelize');

const config = require('../../../config/environment');

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
  sequelize: new Sequelize(config.LOGIN_MYSQL, sqlDefaults),
};

['AccessToken'].forEach((model) => {
  db[model] = db.sequelize.import(`./${_.camelCase(model)}.model.js`);
});

module.exports = db;
