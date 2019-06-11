angular.module('qui.core')
  .factory('User', (Session) => ({
    get userinfo() { return Session.read('adminUserinfo'); },
    get states() { return Session.read('states'); },
    get orderStates() { return Session.read('order-types'); },
  }));
