

module.exports = ({ GROUP: { MEMBER, OPS } }) => [{
  id: 1,
  name: 'Accounts',
  client_id: 'accounts',
  client_secret: '83723bc3eaaec892badb3ce8367ffb6a',
  port: 5001,
  redirect_uri: '',
  group_id: null,
}, {
  id: 2,
  name: 'Ops',
  client_id: 'ops',
  client_secret: 'opssecret',
  port: 5002,
  redirect_uri: 'http://ops.shoppre.test/access/oauth',
  group_id: OPS,
}, {
  id: 3,
  name: 'Membership',
  client_id: 'member',
  client_secret: 'membershipsecret',
  port: 5003,
  redirect_uri: 'http://member.shoppre.test/access/oauth',
  group_id: MEMBER,
}, {
  id: 4,
  name: 'WWW',
  client_id: 'www',
  client_secret: 'wwwsecret',
  port: 5004,
  redirect_uri: 'http://www.shoppre.test/access/oauth',
  group_id: null,
}];
