module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert(
      'groups', [
        { id: 1, name: 'Ops' },
        { id: 2, name: 'Members' },
      ],
      {},
    );
  },
  down(queryInterface) {
    return queryInterface.bulkDelete('groups', { id: [1, 2, 3, 4] });
  },
};
