module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('apps', [{
      id: 1,
      name: 'Accounts',
      client_id: 'accounts',
      client_secret: '83723bc3eaaec892badb3ce8367ffb6a',
      redirect_uri: '',
      user_id: 1,
    }, {
      id: 2,
      name: 'Ops',
      client_id: 'ops',
      client_secret: 'opssecret',
      redirect_uri: 'http://ops.shoppre.test/access/oauth',
      user_id: 1,
    }, {
      id: 3,
      name: 'Membership',
      client_id: 'member',
      client_secret: 'membershipsecret',
      redirect_uri: 'http://member.shoppre.test/access/oauth',
      user_id: 1,
    }], {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('apps', { id: [1] });
  },
};
