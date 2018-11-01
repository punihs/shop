angular.module('qui.core')
  .factory('User', (Session) => ({
    get userinfo() { return Session.read('userinfo'); },
    get states() { return Session.read('states'); },
  }));
