
class QuickStateChangeController {
  /* @ngInject */
  constructor($http, StateChange, Session) {
    this.$http = $http;
    this.StateChange = StateChange;
    this.Session = Session;
    this.$onInit();
  }

  $onInit() {
    this.states = this.Session.read(`${this.type === 'shipment' ? 'shipment-' : ''}states`);
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
      data: '=',
      type: '=',
    },
  }));
