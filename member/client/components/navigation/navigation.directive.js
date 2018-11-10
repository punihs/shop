
(() => {
  class NavigationController {
    /*  @ngInject  */
    constructor($http, $timeout, Session) {
      this.$http = $http;
      this.$timeout = $timeout;
      this.Session = Session;
      this.$onInit();
    }

    $onInit() {
      this.user = this.Session.read('userinfo');
      this.states = this.Session.read('states');
      this.active = 'calendar';
    }

    toggle(tab) {
      this.active = tab === this.active ? null : tab;
    }
  }

  angular.module('uiGenApp')
    .directive('navigation', () => ({
      templateUrl: 'components/navigation/navigation.html',
      restrict: 'E',
      controller: NavigationController,
      controllerAs: '$ctrl',
      bindToController: true,
    }));
})();
