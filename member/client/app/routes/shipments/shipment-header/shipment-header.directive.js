(() => {
  class DirectiveShipmentHeaderController {
    /*  @ngInject  */
    constructor($http, $log, Session) {
      this.$http = $http;
      this.$log = $log;
      this.Session = Session;
      this.moment = moment;
      this.$onInit();
    }

    $onInit() {
      this.user = this.Session.read('userinfo');
    }

  }

  angular.module('uiGenApp')
    .directive('shipmentHeader', () => ({
      templateUrl: 'app/routes/shipments/shipment-header/shipment-header.html',
      restrict: 'E',
      scope: { shipment: '=' },
      controller: DirectiveShipmentHeaderController,
      controllerAs: '$ctrl',
      bindToController: true,
    }));
})();
