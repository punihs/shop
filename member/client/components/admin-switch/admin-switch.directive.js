(function () {
  class AdminSwitchController {
    /* @ngInject */
    constructor($state, $rootScope, Session) {
      this.$state = $state;
      this.$rootScope = $rootScope;
      this.Session = Session;
    }

    setCompanyView(status) {
      this.Session.create('ROLE_ADMIN', status);
      this.settings.isAdmin = status;
      this
        .$rootScope
        .$broadcast('AdminView', status);
      this.$state.reload();
    }
  }

  angular
    .module('uiGenApp')
    .directive('adminSwitch', () => ({
      templateUrl: 'components/admin-switch/admin-switch.html',
      restrict: 'E',
      controller: AdminSwitchController,
      controllerAs: '$ctrl',
      bindToController: true,
      scope: {
        settings: '='
      },
    }));
})();
