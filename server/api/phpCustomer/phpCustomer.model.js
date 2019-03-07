const properties = require('./phpCustomer.property');

module.exports = (sequelize, Datatypes) => {
  const PHPCustomer = sequelize.define('PHPCustomer', properties(Datatypes), {
    tableName: 'php_customers',
    underscored: true,
  });

  return PHPCustomer;
};

