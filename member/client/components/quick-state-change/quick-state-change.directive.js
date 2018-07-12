(function () {
  class QuickStateChangeController {
    /* @ngInject */
    constructor($http, ChangeState, Session) {
      this.$http = $http;
      this.ChangeState = ChangeState;
      this.Session = Session;
      this.$onInit();
    }

    $onInit() {
      this.states = this.Session.read('states');
    }
  }

  angular
    .module('uiGenApp')
    .directive('quickStateChange', () => ({
      templateUrl: 'components/quick-state-change/quick-state-change.html',
      restrict: 'E',
      controller: QuickStateChangeController,
      controllerAs: '$ctrl',
      bindToController: true,
      scope: {
        applicant: '=',
      },
    }));
}());
