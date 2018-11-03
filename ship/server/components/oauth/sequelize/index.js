const _ = require('lodash');

module.exports = (database) => {
  const db = database;
  ['AccessToken'].forEach((model) => {
    db[model] = db.sequelize.import(`./${_.camelCase(model)}.model.js`);
  });
};
