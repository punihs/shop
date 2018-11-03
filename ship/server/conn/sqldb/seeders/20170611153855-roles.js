module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('roles', [{
      id: 1,
      name: 'CEO',
    }, {
      id: 2,
      name: 'Reception',
    }, {
      id: 3,
      name: 'Package Verifier',
    }, {
      id: 4,
      name: 'Storage',
    }, {
      id: 5,
      name: 'Packager',
    },
    ], {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('roles', { id: [1, 2] });
  },
};
