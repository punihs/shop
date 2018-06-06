
const _ = require('lodash');
const Ajv = require('ajv');

const { createAddress } = require('../../api/address/address.schema');

const ajv = new Ajv();
ajv.addSchema(createAddress, 'createAddress');

module.exports = {
  transform() {
    const field = (ajv.errorsText()).split("'")[1].slice(1);
    return { field, message: `Please check ${_.startCase(_.toLower((field.split('_').join(' '))))}` };
  },
  ajv,
};

