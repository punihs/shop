const { referCode } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('refer_code', referCode, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('refer_code', { id: referCode.map(x => x.id) });
  },
};
