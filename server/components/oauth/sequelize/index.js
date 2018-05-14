const _ = require('lodash');

module.exports = (database) => {
  const db = database;
  ['App', 'AuthCode', 'Session', 'AccessToken', 'RefreshToken', 'Session'].forEach((model) => {
    db[model] = db.sequelize.import(`./${_.camelCase(model)}.model.js`);
  });
};
