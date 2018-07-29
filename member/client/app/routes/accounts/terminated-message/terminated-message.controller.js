angular.module('uiGenApp')
  .controller('TerminatedMessageCtrl', ($scope, Auth, $window, $state, User) => {
    Auth.setSessionData().then(() => {
      const whatBlocked = User.userinfo.whatBlocked || [];

      if (whatBlocked.some(b => b.state === 'accounts.terminated-message')) {
        $state.go('packages.index', { status: 'New' });
      }
    });
  });
