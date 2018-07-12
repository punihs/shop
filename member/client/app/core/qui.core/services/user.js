angular.module('qui.core')
  .factory('User', function Auth(Session) {
    const UserFactory = {
      get userinfo() { return Session.read('userinfo'); },
      get states() { return Session.read('states'); },
    };
    return UserFactory;
  });
