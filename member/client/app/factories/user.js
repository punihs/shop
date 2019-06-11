angular.module('uiGenApp')
  .factory('User', (Session) => ({
    get userinfo() { return Session.read('userinfo'); },
    get states() { return Session.read('states'); },
  }));
