(() => {
  class DirectiveCustomerHeaderController {
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
    .directive('customerHeader', () => ({
      templateUrl: 'app/routes/customers/customer-header/customer-header.html',
      restrict: 'E',
      scope: { customer: '=' },
      controller: DirectiveCustomerHeaderController,
      controllerAs: '$ctrl',
      bindToController: true,
    }));
})();
