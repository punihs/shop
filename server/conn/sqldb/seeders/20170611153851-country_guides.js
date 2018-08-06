const { countryGuide } = require('./../constants');

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert(
      'country_guides', countryGuide,
      {},
    );
  },
  down(queryInterface) {
    return queryInterface.bulkDelete('country_guides', { id: countryGuide.map(x => x.id) });
  },
};
